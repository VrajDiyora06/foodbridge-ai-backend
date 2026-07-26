import crypto from 'crypto';

/**
 * Generate a cryptographically secure random hex token.
 * Used for email verification, password reset, and invitation tokens.
 *
 * @param bytes - Number of random bytes (default 32, producing 64 hex chars)
 */
export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a cryptographically secure UUID v4.
 * Used as JWT `jti` claims and refresh token identifiers.
 */
export const generateTokenId = (): string => {
  return crypto.randomUUID();
};

/**
 * Generate a cryptographically secure numeric OTP.
 * Uses rejection sampling to avoid modulo bias.
 *
 * @param length - Number of digits (default 6)
 */
export const generateSecureOTP = (length = 6): string => {
  if (length < 1 || length > 10) {
    throw new Error('OTP length must be between 1 and 10');
  }

  const max = Math.pow(10, length);
  const byteLength = Math.ceil(Math.log2(max) / 8) + 1; // extra byte reduces rejection rate
  const threshold = Math.floor(256 ** byteLength / max) * max; // largest multiple of max that fits

  // Rejection sampling: discard values >= threshold to eliminate modulo bias
  let value: number;
  do {
    const buf = crypto.randomBytes(byteLength);
    value = 0;
    for (let i = 0; i < byteLength; i++) {
      value = value * 256 + buf[i];
    }
  } while (value >= threshold);

  return (value % max).toString().padStart(length, '0');
};

/**
 * Constant-time string comparison to prevent timing attacks.
 * Returns false (rather than throwing) when lengths differ.
 *
 * @param a - First string
 * @param b - Second string
 */
export const timingSafeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  if (bufA.length !== bufB.length) {
    // Compare bufA against itself so the operation still takes time,
    // then return false. This avoids leaking length information
    // through early return timing.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
};
