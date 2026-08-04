import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config';
import { AppError } from '../utils/appError';
import logger from '../utils/logger';
import { UserRepository } from '../repositories/user.repository';
import { TokenService, AccessTokenPayload } from './token.service';
import { IUserDocument, AccountStatus } from '../models/user.model';
import type { RegisterDto, LoginDto, ResetPasswordDto } from '../validations/auth.validation';
import { addEmailJob } from '../jobs';

// ── Response types ───────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  user: IUserDocument;
  verificationToken?: string; // returned in development only
}

export interface LoginResult {
  user: IUserDocument;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

// ── Auth service ─────────────────────────────────────────

export class AuthService {
  private readonly userRepo: UserRepository;
  private readonly tokenService: TokenService;

  constructor() {
    this.userRepo = new UserRepository();
    this.tokenService = new TokenService();
  }

  // ─── Register ────────────────────────────────────────

  async register(dto: RegisterDto): Promise<RegisterResult> {
    const exists = await this.userRepo.existsByEmail(dto.email);
    if (exists) {
      throw new AppError('Email already registered', StatusCodes.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(dto.password, env.bcryptSaltRounds);

    const user = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      isVerified: env.isDevelopment,
    });

    const verificationToken = await this.tokenService.storeVerificationToken(
      user._id.toString(),
    );

    logger.info('User registered', { userId: user._id, email: user.email });

    // Enqueue email verification job
    try {
      await addEmailJob({
        type: 'VERIFICATION_EMAIL',
        to: user.email,
        subject: 'Verify your FoodBridge AI account',
        template: 'verify-email',
        data: {
          name: user.name,
          verificationToken,
          clientUrl: env.clientUrl,
        },
      });
    } catch (err) {
      logger.error('Failed to enqueue verification email job', {
        userId: user._id,
        error: (err as Error).message,
      });
    }

    // In production the token would be emailed, not returned in the response.
    // We expose it in development so the flow can be tested without SMTP.
    return {
      user,
      verificationToken: env.isDevelopment ? verificationToken : undefined,
    };
  }

  // ─── Email verification ──────────────────────────────

  async verifyEmail(token: string): Promise<void> {
    const userId = await this.tokenService.getVerificationUser(token);
    if (!userId) {
      throw new AppError('Invalid or expired verification token', StatusCodes.BAD_REQUEST);
    }

    const user = await this.userRepo.markEmailVerified(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    await this.tokenService.deleteVerificationToken(token);

    logger.info('Email verified', { userId });
  }

  // ─── Login ───────────────────────────────────────────

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepo.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new AppError('Account is not active', StatusCodes.FORBIDDEN);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email before logging in', StatusCodes.FORBIDDEN);
    }

    const accessToken = this.tokenService.generateAccessToken(
      user._id.toString(),
      user.role,
    );

    const { token: refreshToken, tokenId } = this.tokenService.generateRefreshToken(
      user._id.toString(),
    );

    await this.tokenService.storeRefreshToken(user._id.toString(), tokenId);

    // Fire-and-forget: don't block the login response for a timestamp update
    this.userRepo.updateLastLogin(user._id.toString()).catch((err) => {
      logger.error('Failed to update last login', { userId: user._id, error: err.message });
    });

    logger.info('User logged in', { userId: user._id });

    return { user, accessToken, refreshToken };
  }

  // ─── Refresh token ───────────────────────────────────

  async refreshToken(currentRefreshToken: string): Promise<RefreshResult> {
    let payload: { userId: string; tokenId: string };

    try {
      payload = this.tokenService.verifyRefreshToken(currentRefreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', StatusCodes.UNAUTHORIZED);
    }

    const isValid = await this.tokenService.isRefreshTokenValid(payload.userId, payload.tokenId);
    if (!isValid) {
      // Token was valid JWT-wise but not in Redis — possible reuse attack.
      // Revoke all tokens for this user as a precaution.
      await this.tokenService.revokeAllUserRefreshTokens(payload.userId);
      logger.warn('Refresh token reuse detected, all tokens revoked', {
        userId: payload.userId,
      });
      throw new AppError('Refresh token has been revoked', StatusCodes.UNAUTHORIZED);
    }

    // Rotate: delete old, issue new
    await this.tokenService.revokeRefreshToken(payload.userId, payload.tokenId);

    const user = await this.userRepo.findById(payload.userId);
    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new AppError('Account is not active', StatusCodes.FORBIDDEN);
    }

    const accessToken = this.tokenService.generateAccessToken(
      user._id.toString(),
      user.role,
    );

    const { token: newRefreshToken, tokenId: newTokenId } =
      this.tokenService.generateRefreshToken(user._id.toString());

    await this.tokenService.storeRefreshToken(user._id.toString(), newTokenId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  // ─── Forgot password ────────────────────────────────

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userRepo.findByEmail(email);

    // Always return the same message regardless of whether the user exists.
    // This prevents email enumeration attacks.
    const message = 'If an account with that email exists, a password reset link has been sent';

    if (!user) {
      return message;
    }

    const resetToken = await this.tokenService.storePasswordResetToken(
      user._id.toString(),
    );

    // Enqueue password reset email job
    try {
      await addEmailJob({
        type: 'PASSWORD_RESET',
        to: user.email,
        subject: 'Reset your FoodBridge AI password',
        template: 'reset-password',
        data: {
          name: user.name,
          resetToken,
          clientUrl: env.clientUrl,
        },
      });
    } catch (err) {
      logger.error('Failed to enqueue password reset email job', {
        userId: user._id,
        error: (err as Error).message,
      });
    }

    // In production: send an email with `${env.clientUrl}/reset-password?token=${resetToken}`
    // For now, log in development so it can be tested without SMTP.
    if (env.isDevelopment) {
      logger.info('Password reset token generated (dev only)', { resetToken, userId: user._id });
    }

    return message;
  }

  // ─── Reset password ─────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const userId = await this.tokenService.getPasswordResetUser(dto.token);
    if (!userId) {
      throw new AppError('Invalid or expired reset token', StatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(dto.password, env.bcryptSaltRounds);

    const user = await this.userRepo.updatePassword(userId, hashedPassword);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Invalidate all existing sessions after a password change
    await Promise.all([
      this.tokenService.revokeAllUserRefreshTokens(userId),
      this.tokenService.deletePasswordResetToken(dto.token),
    ]);

    logger.info('Password reset completed', { userId });
  }

  // ─── Logout ──────────────────────────────────────────

  async logout(accessPayload: AccessTokenPayload, refreshToken: string): Promise<void> {
    // Blacklist the access token for its remaining lifetime.
    // We decode the refresh token to get the tokenId for revocation.
    const decoded = accessPayload;
    const accessExp = this.getTokenRemainingTtl(decoded);

    await this.tokenService.blacklistAccessToken(decoded.jti, accessExp);

    try {
      const refreshPayload = this.tokenService.verifyRefreshToken(refreshToken);
      await this.tokenService.revokeRefreshToken(refreshPayload.userId, refreshPayload.tokenId);
    } catch {
      // Refresh token may already be expired or invalid — that's fine,
      // the access token is still blacklisted.
      logger.warn('Refresh token invalid during logout, skipping revocation');
    }

    logger.info('User logged out', { userId: decoded.userId });
  }

  // ─── Get current user ────────────────────────────────

  async getCurrentUser(userId: string): Promise<IUserDocument> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    return user;
  }

  // ─── Internal helpers ────────────────────────────────

  /**
   * Calculate remaining TTL in seconds from a JWT payload.
   * Falls back to 900s (15 min) if exp is missing.
   */
  private getTokenRemainingTtl(payload: AccessTokenPayload): number {
    const decoded = payload as AccessTokenPayload & { exp?: number };
    if (!decoded.exp) return 900;
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    return Math.max(remaining, 0);
  }
}
