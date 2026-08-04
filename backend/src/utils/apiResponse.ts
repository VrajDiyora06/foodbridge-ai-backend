import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface ApiResponsePayload<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

/**
 * Uniform API response wrapper. Every endpoint returns the same
 * envelope so clients can parse responses predictably.
 */
export class ApiResponse {
  static send<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    meta?: Record<string, unknown>,
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: statusCode < 400,
      statusCode,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
    };
    return res.status(statusCode).json(payload);
  }

  static ok<T>(res: Response, data?: T, message = 'OK') {
    return this.send(res, StatusCodes.OK, message, data);
  }

  static created<T>(res: Response, data?: T, message = 'Created') {
    return this.send(res, StatusCodes.CREATED, message, data);
  }

  static accepted<T>(res: Response, data?: T, message = 'Accepted') {
    return this.send(res, StatusCodes.ACCEPTED, message, data);
  }

  static noContent(res: Response) {
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  static badRequest(res: Response, message = 'Bad Request') {
    return this.send(res, StatusCodes.BAD_REQUEST, message);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return this.send(res, StatusCodes.UNAUTHORIZED, message);
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return this.send(res, StatusCodes.FORBIDDEN, message);
  }

  static notFound(res: Response, message = 'Not Found') {
    return this.send(res, StatusCodes.NOT_FOUND, message);
  }

  static conflict(res: Response, message = 'Conflict') {
    return this.send(res, StatusCodes.CONFLICT, message);
  }

  static tooMany(res: Response, message = 'Too Many Requests') {
    return this.send(res, StatusCodes.TOO_MANY_REQUESTS, message);
  }

  static internal(res: Response, message = 'Internal Server Error') {
    return this.send(res, StatusCodes.INTERNAL_SERVER_ERROR, message);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'OK',
  ) {
    return this.send(res, StatusCodes.OK, message, data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }
}
