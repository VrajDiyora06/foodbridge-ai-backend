import { StatusCodes } from 'http-status-codes';

/**
 * Custom operational error. Throw this from services/controllers
 * when you want a specific HTTP status code and message surfaced
 * to the client. The global error handler recognizes this class
 * and treats it differently from unexpected crashes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
