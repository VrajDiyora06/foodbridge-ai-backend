import winston from 'winston';
import path from 'path';
import { env } from '../config';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Human-readable format for local dev
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  }),
);

// Structured JSON for production log aggregators (ELK, Datadog, etc.)
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: env.logLevel,
  defaultMeta: { service: 'foodbridge-api' },
  format: env.isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    // File transports — rotated externally in production (Docker/logrotate)
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5_242_880, // 5 MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5_242_880,
      maxFiles: 5,
    }),
  ],
  // Don't crash the process on uncaught logging errors
  exitOnError: false,
});

// Silence logs during tests to keep output clean
if (env.isTest) {
  logger.silent = true;
}

export default logger;
