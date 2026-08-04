import {
  generateRandomToken,
  generateTokenId,
  generateSecureOTP,
  timingSafeCompare,
} from '../../src/utils/crypto.util';
import { ApiResponse } from '../../src/utils/apiResponse';
import { AppError } from '../../src/utils/appError';

// ── Crypto utilities ────────────────────────────────────

describe('Crypto Utilities', () => {
  describe('generateRandomToken', () => {
    it('should generate hex token of expected length', () => {
      const token = generateRandomToken(32);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64);
    });

    it('should generate unique tokens on each call', () => {
      const a = generateRandomToken();
      const b = generateRandomToken();
      expect(a).not.toBe(b);
    });

    it('should default to 32 bytes (64 hex chars)', () => {
      const token = generateRandomToken();
      expect(token.length).toBe(64);
    });
  });

  describe('generateTokenId', () => {
    it('should generate UUID v4 format', () => {
      const id = generateTokenId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should produce unique IDs', () => {
      const ids = Array.from({ length: 10 }, () => generateTokenId());
      const unique = new Set(ids);
      expect(unique.size).toBe(10);
    });
  });

  describe('generateSecureOTP', () => {
    it('should generate numeric OTP of specified length', () => {
      const otp = generateSecureOTP(6);
      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should pad short OTPs with leading zeros', () => {
      // Run multiple times to increase chance of hitting a low value
      for (let i = 0; i < 20; i++) {
        const otp = generateSecureOTP(4);
        expect(otp.length).toBe(4);
        expect(/^\d{4}$/.test(otp)).toBe(true);
      }
    });

    it('should throw for length < 1', () => {
      expect(() => generateSecureOTP(0)).toThrow();
    });

    it('should throw for length > 10', () => {
      expect(() => generateSecureOTP(11)).toThrow();
    });
  });

  describe('timingSafeCompare', () => {
    it('should return true for equal strings', () => {
      expect(timingSafeCompare('hello', 'hello')).toBe(true);
    });

    it('should return false for different strings of same length', () => {
      expect(timingSafeCompare('hello', 'world')).toBe(false);
    });

    it('should return false for different length strings', () => {
      expect(timingSafeCompare('short', 'much longer string')).toBe(false);
    });

    it('should return true for empty strings', () => {
      expect(timingSafeCompare('', '')).toBe(true);
    });
  });
});

// ── ApiResponse ─────────────────────────────────────────

describe('ApiResponse Utility', () => {
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should format ok response (200)', () => {
    ApiResponse.ok(res, { id: '123' }, 'Success message');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      statusCode: 200,
      message: 'Success message',
      data: { id: '123' },
    });
  });

  it('should format created response (201)', () => {
    ApiResponse.created(res, { id: '123' }, 'Item created');

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      statusCode: 201,
      message: 'Item created',
      data: { id: '123' },
    });
  });

  it('should format noContent response (204)', () => {
    res.send = jest.fn().mockReturnThis();
    ApiResponse.noContent(res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should format paginated response with meta', () => {
    ApiResponse.paginated(res, [{ id: 1 }], 1, 10, 1);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        statusCode: 200,
        data: [{ id: 1 }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    );
  });
});

// ── AppError ────────────────────────────────────────────

describe('AppError', () => {
  it('should create operational error with status code', () => {
    const err = new AppError('Not found', 404);

    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it('should capture stack trace', () => {
    const err = new AppError('Test', 500);
    expect(err.stack).toBeDefined();
  });
});
