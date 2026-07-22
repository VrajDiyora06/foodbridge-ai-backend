import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Assigns a unique request ID (or reads one from a reverse proxy header)
 * and attaches it to the request object for correlation in logs.
 */
export const requestId = (req: Request, _res: Response, next: NextFunction): void => {
  const id =
    (req.headers['x-request-id'] as string) ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  req.headers['x-request-id'] = id;
  next();
};

/**
 * Logs request start and finish with timing.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const reqId = req.headers['x-request-id'];

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      requestId: reqId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
    });
  });

  next();
};
