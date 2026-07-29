import jwt from 'jsonwebtoken';
import { env } from '../config';
import { getRedisClient } from '../database';
import { generateTokenId, generateRandomToken } from '../utils/crypto.util';
import logger from '../utils/logger';

// ── JWT payload interfaces ───────────────────────────────

export interface AccessTokenPayload {
  userId: string;
  role: string;
  jti: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

// ── Redis key builders ───────────────────────────────────

const KEYS = {
  refresh: (userId: string, tokenId: string) => `refresh:${userId}:${tokenId}`,
  refreshPattern: (userId: string) => `refresh:${userId}:*`,
  verifyEmail: (token: string) => `verify-email:${token}`,
  resetPassword: (token: string) => `reset-password:${token}`,
  blacklist: (jti: string) => `blacklist:${jti}`,
};

// ── Token service ────────────────────────────────────────

export class TokenService {
  // ─── Access tokens ───────────────────────────────────

  /** Generate a short-lived access token with userId, role, and jti. */
  generateAccessToken(userId: string, role: string): string {
    const jti = generateTokenId();
    return jwt.sign({ userId, role, jti }, env.jwtSecret, {
      expiresIn: this.parseDurationToSeconds(env.jwtExpiresIn),
    });
  }

  /** Verify and decode an access token. Returns the typed payload. */
  verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    return decoded;
  }

  // ─── Refresh tokens ──────────────────────────────────

  /** Generate a long-lived refresh token with userId and tokenId. */
  generateRefreshToken(userId: string): { token: string; tokenId: string } {
    const tokenId = generateTokenId();
    const token = jwt.sign({ userId, tokenId }, env.jwtRefreshSecret, {
      expiresIn: this.parseDurationToSeconds(env.jwtRefreshExpiresIn),
    });
    return { token, tokenId };
  }

  /** Verify and decode a refresh token. Returns the typed payload. */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
    return decoded;
  }

  // ─── Redis: refresh token lifecycle ──────────────────

  /** Store a refresh token reference in Redis with 30-day TTL. */
  async storeRefreshToken(userId: string, tokenId: string): Promise<void> {
    const redis = getRedisClient();
    const ttl = this.parseDurationToSeconds(env.jwtRefreshExpiresIn);
    await redis.set(KEYS.refresh(userId, tokenId), '1', 'EX', ttl);
  }

  /** Check whether a refresh token still exists in Redis. */
  async isRefreshTokenValid(userId: string, tokenId: string): Promise<boolean> {
    const redis = getRedisClient();
    const exists = await redis.exists(KEYS.refresh(userId, tokenId));
    return exists === 1;
  }

  /** Remove a single refresh token (used during rotation and logout). */
  async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    const redis = getRedisClient();
    await redis.del(KEYS.refresh(userId, tokenId));
  }

  /** Remove all refresh tokens for a user (used after password reset). */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const redis = getRedisClient();
    const pattern = KEYS.refreshPattern(userId);

    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');

    logger.info('Revoked all refresh tokens for user', { userId });
  }

  // ─── Redis: email verification tokens ────────────────

  /** Generate and store an email verification token. Returns the hex token. */
  async storeVerificationToken(userId: string): Promise<string> {
    const redis = getRedisClient();
    const token = generateRandomToken();
    await redis.set(KEYS.verifyEmail(token), userId, 'EX', env.emailVerificationTtl);
    return token;
  }

  /** Look up which user a verification token belongs to. Returns userId or null. */
  async getVerificationUser(token: string): Promise<string | null> {
    const redis = getRedisClient();
    return redis.get(KEYS.verifyEmail(token));
  }

  /** Delete a verification token after successful verification. */
  async deleteVerificationToken(token: string): Promise<void> {
    const redis = getRedisClient();
    await redis.del(KEYS.verifyEmail(token));
  }

  // ─── Redis: password reset tokens ────────────────────

  /** Generate and store a password reset token. Returns the hex token. */
  async storePasswordResetToken(userId: string): Promise<string> {
    const redis = getRedisClient();
    const token = generateRandomToken();
    await redis.set(KEYS.resetPassword(token), userId, 'EX', env.passwordResetTtl);
    return token;
  }

  /** Look up which user a reset token belongs to. Returns userId or null. */
  async getPasswordResetUser(token: string): Promise<string | null> {
    const redis = getRedisClient();
    return redis.get(KEYS.resetPassword(token));
  }

  /** Delete a reset token after successful password change. */
  async deletePasswordResetToken(token: string): Promise<void> {
    const redis = getRedisClient();
    await redis.del(KEYS.resetPassword(token));
  }

  // ─── Redis: access token blacklist ───────────────────

  /** Blacklist an access token's jti so it can't be reused after logout. */
  async blacklistAccessToken(jti: string, ttlSeconds: number): Promise<void> {
    const redis = getRedisClient();
    await redis.set(KEYS.blacklist(jti), '1', 'EX', ttlSeconds);
  }

  /** Check whether an access token has been blacklisted. */
  async isAccessTokenBlacklisted(jti: string): Promise<boolean> {
    const redis = getRedisClient();
    const exists = await redis.exists(KEYS.blacklist(jti));
    return exists === 1;
  }

  // ─── Internal helpers ────────────────────────────────

  /**
   * Parse a duration string like '15m', '7d', '30d' into seconds.
   * Supports: s (seconds), m (minutes), h (hours), d (days).
   */
  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Fallback: assume it's already in seconds
      const num = parseInt(duration, 10);
      if (isNaN(num)) throw new Error(`Invalid duration format: ${duration}`);
      return num;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        throw new Error(`Unsupported duration unit: ${unit}`);
    }
  }
}
