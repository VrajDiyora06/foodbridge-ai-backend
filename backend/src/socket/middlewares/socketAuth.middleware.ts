import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { TokenService } from '../../services/token.service';
import { UserRepository } from '../../repositories/user.repository';
import { AccountStatus } from '../../models/user.model';
import logger from '../../utils/logger';

export interface SocketUserContext {
  id: string;
  role: string;
  email: string;
  isVerified: boolean;
}

declare module 'socket.io' {
  interface SocketData {
    user?: SocketUserContext;
  }
}

const tokenService = new TokenService();
const userRepo = new UserRepository();

/**
 * Socket.IO authentication middleware verifying JWT access token on handshake.
 */
export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
): Promise<void> => {
  try {
    // Extract token from handshake auth object or headers
    const rawToken =
      (socket.handshake.auth && (socket.handshake.auth.token as string)) ||
      socket.handshake.headers.authorization;

    if (!rawToken) {
      logger.warn('[Socket.IO Auth] Connection rejected — Token missing', {
        socketId: socket.id,
      });
      return next(new Error('Authentication error: Token missing'));
    }

    // Strip Bearer prefix if present
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7).trim() : rawToken.trim();

    if (!token) {
      logger.warn('[Socket.IO Auth] Connection rejected — Token empty', {
        socketId: socket.id,
      });
      return next(new Error('Authentication error: Token missing'));
    }

    // Verify JWT access token
    let payload;
    try {
      payload = tokenService.verifyAccessToken(token);
    } catch (err) {
      logger.warn('[Socket.IO Auth] Connection rejected — Invalid or expired token', {
        socketId: socket.id,
        error: (err as Error).message,
      });
      return next(new Error('Authentication error: Invalid or expired token'));
    }

    // Check token blacklist (revoked on logout)
    if (payload.jti) {
      const isBlacklisted = await tokenService.isAccessTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        logger.warn('[Socket.IO Auth] Connection rejected — Token blacklisted', {
          socketId: socket.id,
          jti: payload.jti,
        });
        return next(new Error('Authentication error: Token has been revoked'));
      }
    }

    // Fetch user from database
    const user = await userRepo.findById(payload.userId);
    if (!user) {
      logger.warn('[Socket.IO Auth] Connection rejected — User not found', {
        socketId: socket.id,
        userId: payload.userId,
      });
      return next(new Error('Authentication error: User not found'));
    }

    // Verify user account status
    if (user.accountStatus !== AccountStatus.ACTIVE) {
      logger.warn('[Socket.IO Auth] Connection rejected — User account inactive or suspended', {
        socketId: socket.id,
        userId: user._id,
        status: user.accountStatus,
      });
      return next(new Error('Authentication error: User account is not active'));
    }

    // Attach user context to socket.data
    socket.data.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      isVerified: user.isVerified,
    };

    logger.info('[Socket.IO Auth] Socket connection authenticated successfully', {
      socketId: socket.id,
      userId: user._id,
      role: user.role,
    });

    next();
  } catch (error) {
    const err = error as Error;
    logger.error('[Socket.IO Auth] Unexpected error during socket authentication', {
      socketId: socket.id,
      error: err.message,
    });
    next(new Error('Authentication error: Internal server error'));
  }
};
