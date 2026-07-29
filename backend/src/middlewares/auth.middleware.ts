import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenService } from '../services/token.service';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import { UserRole } from '../models/user.model';

const tokenService = new TokenService();

/**
 * Middleware to verify JWT Access Token from Authorization header.
 * Attaches userId, userRole, and user payload to the request object.
 */
export const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid Bearer token.', StatusCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      payload = tokenService.verifyAccessToken(token);
    } catch {
      throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED);
    }

    const isBlacklisted = await tokenService.isAccessTokenBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new AppError('Token has been revoked', StatusCodes.UNAUTHORIZED);
    }

    req.userId = payload.userId;
    req.userRole = payload.role;
    req.user = payload;

    next();
  },
);

/**
 * Role-based authorization middleware.
 * Restricts route access to specified UserRole values.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole as UserRole)) {
      throw new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN,
      );
    }
    next();
  };
};
