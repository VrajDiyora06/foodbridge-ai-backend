import { z } from 'zod';
import { UserRole } from '../models/user.model';

// ── Shared constants ─────────────────────────────────────

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

/**
 * Requires at least one uppercase, one lowercase, one digit,
 * and one special character. Tested against the full string.
 */
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])/;

const PASSWORD_RULES =
  'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character';

// Reusable password field — used in register and reset schemas
const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`)
  .regex(PASSWORD_REGEX, PASSWORD_RULES);

const confirmPasswordField = z.string({ required_error: 'Confirm password is required' });

// Reusable email field
const emailField = z
  .string({ required_error: 'Email is required' })
  .email('Please provide a valid email address')
  .toLowerCase()
  .trim();

// ── Schemas ──────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    email: emailField,
    password: passwordField,
    confirmPassword: confirmPasswordField,
    role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: emailField,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  token: z.string({ required_error: 'Verification token is required' }).min(1, 'Token is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: 'Reset token is required' }).min(1, 'Token is required'),
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token is required' })
    .min(1, 'Refresh token is required'),
});

// ── Inferred DTO types ───────────────────────────────────

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
