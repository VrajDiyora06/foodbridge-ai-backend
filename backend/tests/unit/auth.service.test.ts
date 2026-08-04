import bcrypt from 'bcryptjs';
import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { TokenService } from '../../src/services/token.service';
import { AppError } from '../../src/utils/appError';
import { AccountStatus, UserRole } from '../../src/models/user.model';
import { createMockUser } from '../helpers/testData';

// Mock dependencies
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/services/token.service');
jest.mock('../../src/jobs', () => ({
  addEmailJob: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('../../src/config', () => ({
  env: {
    bcryptSaltRounds: 10,
    isDevelopment: true,
    clientUrl: 'http://localhost:3000',
    jwtSecret: 'test-secret',
    jwtExpiresIn: '15m',
    jwtRefreshSecret: 'test-refresh-secret',
    jwtRefreshExpiresIn: '7d',
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    mockUserRepo = (authService as any).userRepo;
    mockTokenService = (authService as any).tokenService;
  });

  // ── register ──────────────────────────────────────────

  describe('register', () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      role: UserRole.DONOR,
    };

    it('should register a new user and return verification token in dev mode', async () => {
      mockUserRepo.existsByEmail = jest.fn().mockResolvedValue(false);
      const mockUser = createMockUser();
      mockUserRepo.create = jest.fn().mockResolvedValue(mockUser);
      mockTokenService.storeVerificationToken = jest.fn().mockResolvedValue('verify-token-123');

      const result = await authService.register(dto);

      expect(mockUserRepo.existsByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockTokenService.storeVerificationToken).toHaveBeenCalledWith(mockUser._id);
      expect(result.user).toEqual(mockUser);
      expect(result.verificationToken).toBe('verify-token-123');
    });

    it('should throw 409 when email is already registered', async () => {
      mockUserRepo.existsByEmail = jest.fn().mockResolvedValue(true);

      await expect(authService.register(dto)).rejects.toThrow(AppError);
      await expect(authService.register(dto)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  // ── verifyEmail ───────────────────────────────────────

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      mockTokenService.getVerificationUser = jest.fn().mockResolvedValue('user-id');
      mockUserRepo.markEmailVerified = jest.fn().mockResolvedValue(createMockUser());
      mockTokenService.deleteVerificationToken = jest.fn().mockResolvedValue(undefined);

      await authService.verifyEmail('valid-token');

      expect(mockUserRepo.markEmailVerified).toHaveBeenCalledWith('user-id');
      expect(mockTokenService.deleteVerificationToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw 400 for invalid or expired token', async () => {
      mockTokenService.getVerificationUser = jest.fn().mockResolvedValue(null);

      await expect(authService.verifyEmail('bad-token')).rejects.toThrow(AppError);
    });

    it('should throw 404 if user is not found', async () => {
      mockTokenService.getVerificationUser = jest.fn().mockResolvedValue('user-id');
      mockUserRepo.markEmailVerified = jest.fn().mockResolvedValue(null);

      await expect(authService.verifyEmail('valid-token')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── login ─────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'SecurePass123!' };

    it('should return tokens and user on valid credentials', async () => {
      const mockUser = createMockUser({
        password: await bcrypt.hash('SecurePass123!', 10),
      });
      mockUserRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken = jest.fn().mockReturnValue('access-jwt');
      mockTokenService.generateRefreshToken = jest.fn().mockReturnValue({
        token: 'refresh-jwt',
        tokenId: 'token-id',
      });
      mockTokenService.storeRefreshToken = jest.fn().mockResolvedValue(undefined);
      mockUserRepo.updateLastLogin = jest.fn().mockResolvedValue(undefined);

      const result = await authService.login(dto);

      expect(result.accessToken).toBe('access-jwt');
      expect(result.refreshToken).toBe('refresh-jwt');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw 401 if user does not exist', async () => {
      mockUserRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw 401 if password does not match', async () => {
      const mockUser = createMockUser({
        password: await bcrypt.hash('DifferentPassword', 10),
      });
      mockUserRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.login(dto)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw 403 if account is not active', async () => {
      const mockUser = createMockUser({
        password: await bcrypt.hash('SecurePass123!', 10),
        accountStatus: AccountStatus.SUSPENDED,
      });
      mockUserRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.login(dto)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('should throw 403 if email is not verified', async () => {
      const mockUser = createMockUser({
        password: await bcrypt.hash('SecurePass123!', 10),
        isVerified: false,
      });
      mockUserRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.login(dto)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  // ── refreshToken ──────────────────────────────────────

  describe('refreshToken', () => {
    it('should rotate tokens and return new pair', async () => {
      mockTokenService.verifyRefreshToken = jest.fn().mockReturnValue({
        userId: 'user-id',
        tokenId: 'old-token-id',
      });
      mockTokenService.isRefreshTokenValid = jest.fn().mockResolvedValue(true);
      mockTokenService.revokeRefreshToken = jest.fn().mockResolvedValue(undefined);
      mockUserRepo.findById = jest.fn().mockResolvedValue(createMockUser({ _id: 'user-id' }));
      mockTokenService.generateAccessToken = jest.fn().mockReturnValue('new-access');
      mockTokenService.generateRefreshToken = jest.fn().mockReturnValue({
        token: 'new-refresh',
        tokenId: 'new-token-id',
      });
      mockTokenService.storeRefreshToken = jest.fn().mockResolvedValue(undefined);

      const result = await authService.refreshToken('current-refresh-jwt');

      expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith('user-id', 'old-token-id');
      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
    });

    it('should revoke all tokens on refresh token reuse', async () => {
      mockTokenService.verifyRefreshToken = jest.fn().mockReturnValue({
        userId: 'user-id',
        tokenId: 'reused-token-id',
      });
      mockTokenService.isRefreshTokenValid = jest.fn().mockResolvedValue(false);
      mockTokenService.revokeAllUserRefreshTokens = jest.fn().mockResolvedValue(undefined);

      await expect(authService.refreshToken('reused-jwt')).rejects.toMatchObject({
        statusCode: 401,
      });
      expect(mockTokenService.revokeAllUserRefreshTokens).toHaveBeenCalledWith('user-id');
    });

    it('should throw 401 when refresh JWT is invalid', async () => {
      mockTokenService.verifyRefreshToken = jest.fn().mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(authService.refreshToken('garbage')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  // ── logout ────────────────────────────────────────────

  describe('logout', () => {
    it('should blacklist access token and revoke refresh token', async () => {
      const accessPayload = {
        userId: 'user-id',
        role: 'donor',
        jti: 'jti-abc',
        exp: Math.floor(Date.now() / 1000) + 900,
      } as any;

      mockTokenService.blacklistAccessToken = jest.fn().mockResolvedValue(undefined);
      mockTokenService.verifyRefreshToken = jest.fn().mockReturnValue({
        userId: 'user-id',
        tokenId: 'rt-id',
      });
      mockTokenService.revokeRefreshToken = jest.fn().mockResolvedValue(undefined);

      await authService.logout(accessPayload, 'refresh-jwt');

      expect(mockTokenService.blacklistAccessToken).toHaveBeenCalledWith('jti-abc', expect.any(Number));
      expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith('user-id', 'rt-id');
    });
  });

  // ── getCurrentUser ────────────────────────────────────

  describe('getCurrentUser', () => {
    it('should return user when found', async () => {
      const user = createMockUser();
      mockUserRepo.findById = jest.fn().mockResolvedValue(user);

      const result = await authService.getCurrentUser(user._id);
      expect(result).toEqual(user);
    });

    it('should throw 404 when user not found', async () => {
      mockUserRepo.findById = jest.fn().mockResolvedValue(null);

      await expect(authService.getCurrentUser('missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── forgotPassword ────────────────────────────────────

  describe('forgotPassword', () => {
    it('should return generic message whether user exists or not', async () => {
      mockUserRepo.findByEmail = jest.fn().mockResolvedValue(null);

      const result = await authService.forgotPassword('nonexistent@example.com');

      expect(result).toContain('If an account');
    });

    it('should generate reset token when user exists', async () => {
      const user = createMockUser();
      mockUserRepo.findByEmail = jest.fn().mockResolvedValue(user);
      mockTokenService.storePasswordResetToken = jest.fn().mockResolvedValue('reset-token-hex');

      const result = await authService.forgotPassword('test@example.com');

      expect(mockTokenService.storePasswordResetToken).toHaveBeenCalledWith(user._id);
      expect(result).toContain('If an account');
    });
  });

  // ── resetPassword ─────────────────────────────────────

  describe('resetPassword', () => {
    it('should hash new password, update, and revoke all sessions', async () => {
      mockTokenService.getPasswordResetUser = jest.fn().mockResolvedValue('user-id');
      mockUserRepo.updatePassword = jest.fn().mockResolvedValue(createMockUser());
      mockTokenService.revokeAllUserRefreshTokens = jest.fn().mockResolvedValue(undefined);
      mockTokenService.deletePasswordResetToken = jest.fn().mockResolvedValue(undefined);

      await authService.resetPassword({ token: 'reset-token', password: 'NewPass123!', confirmPassword: 'NewPass123!' });

      expect(mockUserRepo.updatePassword).toHaveBeenCalledWith('user-id', expect.any(String));
      expect(mockTokenService.revokeAllUserRefreshTokens).toHaveBeenCalledWith('user-id');
    });

    it('should throw 400 when reset token is invalid', async () => {
      mockTokenService.getPasswordResetUser = jest.fn().mockResolvedValue(null);

      await expect(
        authService.resetPassword({ token: 'bad', password: 'x', confirmPassword: 'x' }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
