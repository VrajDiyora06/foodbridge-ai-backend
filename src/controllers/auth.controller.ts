import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import { AccessTokenPayload } from '../services/token.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';

/**
 * Controller handling authentication endpoints.
 * All business logic is delegated to AuthService.
 * All HTTP responses are wrapped using ApiResponse.
 */
export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/v1/auth/register
   * Register a new user account.
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);
    ApiResponse.created(res, result, 'User registered successfully');
  });

  /**
   * POST /api/v1/auth/verify-email
   * Verify email address using verification token.
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;
    await this.authService.verifyEmail(token);
    ApiResponse.ok(res, null, 'Email verified successfully');
  });

  /**
   * POST /api/v1/auth/login
   * Authenticate user credentials and return access/refresh tokens.
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    ApiResponse.ok(res, result, 'Login successful');
  });

  /**
   * POST /api/v1/auth/refresh-token
   * Issue new access and refresh token pair using valid refresh token.
   */
  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await this.authService.refreshToken(refreshToken);
    ApiResponse.ok(res, result, 'Token refreshed successfully');
  });

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset token for account.
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const message = await this.authService.forgotPassword(email);
    ApiResponse.ok(res, null, message);
  });

  /**
   * POST /api/v1/auth/reset-password
   * Reset user password using reset token.
   */
  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.authService.resetPassword(req.body);
    ApiResponse.ok(res, null, 'Password reset successfully');
  });

  /**
   * POST /api/v1/auth/logout
   * Blacklist current access token and revoke refresh token.
   */
  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest & { user?: AccessTokenPayload };
    const accessPayload = authReq.user;
    const { refreshToken } = req.body;

    if (!accessPayload) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    await this.authService.logout(accessPayload, refreshToken);
    ApiResponse.ok(res, null, 'Logged out successfully');
  });

  /**
   * GET /api/v1/auth/me
   * Retrieve current authenticated user profile.
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const user = await this.authService.getCurrentUser(authReq.userId);
    ApiResponse.ok(res, user, 'Current user profile fetched successfully');
  });
}

// Export singleton instance for route registration
export const authController = new AuthController();
