import rateLimit from 'express-rate-limit';
import env from '../config/env.config';

/**
 * General auth endpoints rate limiter (register, verify-email, refresh-token).
 * Limits to 10 requests per 15-minute window by default.
 */
export const authLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

/**
 * Login endpoint rate limiter to prevent brute force attacks.
 * Limits to 5 requests per 15-minute window by default.
 */
export const loginLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  max: env.loginRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

/**
 * Password reset endpoint rate limiter to prevent email/reset abuse (forgot-password, reset-password).
 * Limits to 3 requests per 1-hour window by default.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.passwordResetRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
