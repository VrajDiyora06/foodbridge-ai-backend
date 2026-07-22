import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';
import { env } from '../config';
import logger from '../utils/logger';

// ----- Helmet -----
export const helmetMiddleware: RequestHandler = helmet();

// ----- CORS -----
export const corsMiddleware: RequestHandler = cors({
  origin: env.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ----- Compression -----
export const compressionMiddleware: RequestHandler = compression({
  threshold: 1024, // only compress responses > 1 KB
});

// ----- Morgan → Winston -----
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export const morganMiddleware: RequestHandler = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream: morganStream, skip: () => env.isTest },
);

// ----- Rate Limiter -----
export const rateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests — try again later',
  },
});
