import jwt from 'jsonwebtoken';
import { TokenService } from '../../src/services/token.service';

// Mock Redis client
const mockRedis = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  scan: jest.fn().mockResolvedValue(['0', []]),
};

jest.mock('../../src/database', () => ({
  getRedisClient: () => mockRedis,
}));
jest.mock('../../src/config', () => ({
  env: {
    jwtSecret: 'test-jwt-secret-key',
    jwtExpiresIn: '15m',
    jwtRefreshSecret: 'test-jwt-refresh-secret-key',
    jwtRefreshExpiresIn: '7d',
    emailVerificationTtl: 86400,
    passwordResetTtl: 3600,
  },
}));
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    tokenService = new TokenService();
  });

  // ── Access tokens ─────────────────────────────────────

  describe('generateAccessToken', () => {
    it('should generate a valid JWT containing userId, role, and jti', () => {
      const token = tokenService.generateAccessToken('user-123', 'donor');
      const decoded = jwt.verify(token, 'test-jwt-secret-key') as any;

      expect(decoded.userId).toBe('user-123');
      expect(decoded.role).toBe('donor');
      expect(decoded.jti).toBeDefined();
    });

    it('should produce unique jti on each call', () => {
      const t1 = tokenService.generateAccessToken('u1', 'donor');
      const t2 = tokenService.generateAccessToken('u1', 'donor');

      const d1 = jwt.decode(t1) as any;
      const d2 = jwt.decode(t2) as any;

      expect(d1.jti).not.toBe(d2.jti);
    });
  });

  describe('verifyAccessToken', () => {
    it('should decode a valid access token', () => {
      const token = tokenService.generateAccessToken('user-456', 'admin');
      const payload = tokenService.verifyAccessToken(token);

      expect(payload.userId).toBe('user-456');
      expect(payload.role).toBe('admin');
    });

    it('should throw for an invalid token', () => {
      expect(() => tokenService.verifyAccessToken('garbage')).toThrow();
    });

    it('should throw for a token signed with wrong secret', () => {
      const fakeToken = jwt.sign({ userId: 'x' }, 'wrong-secret');
      expect(() => tokenService.verifyAccessToken(fakeToken)).toThrow();
    });
  });

  // ── Refresh tokens ────────────────────────────────────

  describe('generateRefreshToken', () => {
    it('should return token string and tokenId', () => {
      const result = tokenService.generateRefreshToken('user-789');

      expect(typeof result.token).toBe('string');
      expect(typeof result.tokenId).toBe('string');
    });

    it('should embed userId and tokenId in the JWT', () => {
      const { token, tokenId } = tokenService.generateRefreshToken('user-789');
      const decoded = jwt.verify(token, 'test-jwt-refresh-secret-key') as any;

      expect(decoded.userId).toBe('user-789');
      expect(decoded.tokenId).toBe(tokenId);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should decode a valid refresh token', () => {
      const { token } = tokenService.generateRefreshToken('user-111');
      const payload = tokenService.verifyRefreshToken(token);

      expect(payload.userId).toBe('user-111');
      expect(payload.tokenId).toBeDefined();
    });

    it('should throw for an expired or invalid refresh token', () => {
      expect(() => tokenService.verifyRefreshToken('invalid-jwt')).toThrow();
    });
  });

  // ── Redis: refresh token lifecycle ────────────────────

  describe('storeRefreshToken', () => {
    it('should store token reference in Redis with TTL', async () => {
      await tokenService.storeRefreshToken('user-1', 'token-id-1');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'refresh:user-1:token-id-1',
        '1',
        'EX',
        expect.any(Number),
      );
    });
  });

  describe('isRefreshTokenValid', () => {
    it('should return true when token exists in Redis', async () => {
      mockRedis.exists.mockResolvedValueOnce(1);

      const valid = await tokenService.isRefreshTokenValid('user-1', 'token-id-1');
      expect(valid).toBe(true);
    });

    it('should return false when token does not exist', async () => {
      mockRedis.exists.mockResolvedValueOnce(0);

      const valid = await tokenService.isRefreshTokenValid('user-1', 'token-id-1');
      expect(valid).toBe(false);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete the token key from Redis', async () => {
      await tokenService.revokeRefreshToken('user-1', 'token-id-1');

      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1:token-id-1');
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('should scan and delete all refresh keys for a user', async () => {
      mockRedis.scan.mockResolvedValueOnce(['0', ['refresh:user-1:a', 'refresh:user-1:b']]);

      await tokenService.revokeAllUserRefreshTokens('user-1');

      expect(mockRedis.scan).toHaveBeenCalledWith(
        '0', 'MATCH', 'refresh:user-1:*', 'COUNT', 100,
      );
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1:a', 'refresh:user-1:b');
    });

    it('should handle empty scan results gracefully', async () => {
      mockRedis.scan.mockResolvedValueOnce(['0', []]);

      await tokenService.revokeAllUserRefreshTokens('user-99');

      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  // ── Redis: email verification tokens ──────────────────

  describe('storeVerificationToken', () => {
    it('should store a hex token mapping to userId', async () => {
      const token = await tokenService.storeVerificationToken('user-1');

      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
      expect(mockRedis.set).toHaveBeenCalledWith(
        `verify-email:${token}`,
        'user-1',
        'EX',
        86400,
      );
    });
  });

  describe('getVerificationUser', () => {
    it('should return userId for a valid token', async () => {
      mockRedis.get.mockResolvedValueOnce('user-1');

      const userId = await tokenService.getVerificationUser('some-token');
      expect(userId).toBe('user-1');
    });

    it('should return null for an expired or unknown token', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const userId = await tokenService.getVerificationUser('expired');
      expect(userId).toBeNull();
    });
  });

  describe('deleteVerificationToken', () => {
    it('should delete the verification key from Redis', async () => {
      await tokenService.deleteVerificationToken('tok-abc');

      expect(mockRedis.del).toHaveBeenCalledWith('verify-email:tok-abc');
    });
  });

  // ── Redis: password reset tokens ──────────────────────

  describe('storePasswordResetToken', () => {
    it('should store a hex token with TTL', async () => {
      const token = await tokenService.storePasswordResetToken('user-2');

      expect(typeof token).toBe('string');
      expect(mockRedis.set).toHaveBeenCalledWith(
        `reset-password:${token}`,
        'user-2',
        'EX',
        3600,
      );
    });
  });

  describe('getPasswordResetUser', () => {
    it('should return userId for valid reset token', async () => {
      mockRedis.get.mockResolvedValueOnce('user-2');

      const result = await tokenService.getPasswordResetUser('reset-tok');
      expect(result).toBe('user-2');
    });
  });

  // ── Redis: access token blacklist ─────────────────────

  describe('blacklistAccessToken', () => {
    it('should set blacklist key with TTL', async () => {
      await tokenService.blacklistAccessToken('jti-abc', 600);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'blacklist:jti-abc',
        '1',
        'EX',
        600,
      );
    });
  });

  describe('isAccessTokenBlacklisted', () => {
    it('should return true when jti is blacklisted', async () => {
      mockRedis.exists.mockResolvedValueOnce(1);

      const result = await tokenService.isAccessTokenBlacklisted('jti-abc');
      expect(result).toBe(true);
    });

    it('should return false when jti is not blacklisted', async () => {
      mockRedis.exists.mockResolvedValueOnce(0);

      const result = await tokenService.isAccessTokenBlacklisted('jti-xyz');
      expect(result).toBe(false);
    });
  });
});
