import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/appError';
import logger from '../utils/logger';
import { env } from '../config';

/**
 * Global error handler — must be the LAST middleware registered.
 *
 * Distinguishes between:
 * - Operational errors (AppError): expected, client-safe message
 * - Programming errors: logged in full, generic 500 sent to client
 */
export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: err.message,
    });
    return;
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as { code?: number }).code === 11000) {
    res.status(StatusCodes.CONFLICT).json({
      success: false,
      statusCode: StatusCodes.CONFLICT,
      message: 'Duplicate field value',
    });
    return;
  }

  // JWT errors (prepped for when auth lands)
  if (err.name === 'JsonWebTokenError') {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Invalid token',
    });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Token expired',
    });
    return;
  }

  // Our own operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  // Unexpected errors — log full stack, send generic message
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: env.isProduction ? 'Something went wrong' : err.message,
  });
};
