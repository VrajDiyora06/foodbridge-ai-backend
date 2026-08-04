import '../setup/mocks';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/dbSetup';
import { api, authHeader } from '../setup/testHelpers';
import { createUserFixture, createDonor, generateRefreshToken, TEST_PASSWORD } from '../setup/fixtures';
import { mockRedis } from '../setup/mocks';
import { UserRole } from '../../src/models/user.model';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    mockRedis.clear();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // ── Register ──────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.DONOR,
      };

      const res = await api.post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject registration when email is already registered', async () => {
      await createDonor({ email: 'duplicate@example.com' });

      const payload = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.DONOR,
      };

      const res = await api.post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with non-matching passwords', async () => {
      const payload = {
        name: 'Mismatch User',
        email: 'mismatch@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        role: UserRole.DONOR,
      };

      const res = await api.post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Login ─────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate user and return access & refresh tokens', async () => {
      const user = await createUserFixture({
        email: 'login@example.com',
        isVerified: true,
      });

      const res = await api.post('/api/v1/auth/login').send({
        email: 'login@example.com',
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.id || res.body.data.user._id).toBe(user._id.toString());
    });

    it('should return 401 for incorrect password', async () => {
      await createUserFixture({
        email: 'login@example.com',
        isVerified: true,
      });

      const res = await api.post('/api/v1/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 when email is unverified', async () => {
      await createUserFixture({
        email: 'unverified@example.com',
        isVerified: false,
      });

      const res = await api.post('/api/v1/auth/login').send({
        email: 'unverified@example.com',
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Refresh Token ─────────────────────────────────────

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should rotate tokens with a valid refresh token', async () => {
      const user = await createUserFixture({ isVerified: true });
      const { token, tokenId } = generateRefreshToken(user._id.toString());

      // Seed refresh token in Redis
      await mockRedis.set(`refresh:${user._id.toString()}:${tokenId}`, '1');

      const res = await api.post('/api/v1/auth/refresh-token').send({
        refreshToken: token,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should return 401 for revoked/invalid refresh token', async () => {
      const user = await createUserFixture({ isVerified: true });
      const { token } = generateRefreshToken(user._id.toString());

      // Do NOT set in Redis (simulates revoked/reused)
      const res = await api.post('/api/v1/auth/refresh-token').send({
        refreshToken: token,
      });

      expect(res.status).toBe(401);
    });
  });

  // ── Logout ────────────────────────────────────────────

  describe('POST /api/v1/auth/logout', () => {
    it('should logout user and invalidate refresh token', async () => {
      const user = await createUserFixture({ isVerified: true });
      const { token, tokenId } = generateRefreshToken(user._id.toString());
      await mockRedis.set(`refresh:${user._id.toString()}:${tokenId}`, '1');

      const res = await api
        .post('/api/v1/auth/logout')
        .set(authHeader(user._id.toString(), user.role))
        .send({ refreshToken: token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── Forgot Password ───────────────────────────────────

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should handle forgot password request without revealing user status', async () => {
      await createUserFixture({ email: 'forgot@example.com' });

      const res = await api.post('/api/v1/auth/forgot-password').send({
        email: 'forgot@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── Reset Password ────────────────────────────────────

  describe('POST /api/v1/auth/reset-password', () => {
    it('should reset password with valid token in Redis', async () => {
      const user = await createUserFixture({ isVerified: true });
      const resetToken = 'valid-reset-token-123';
      await mockRedis.set(`reset-password:${resetToken}`, user._id.toString());

      const res = await api.post('/api/v1/auth/reset-password').send({
        token: resetToken,
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid/expired reset token', async () => {
      const res = await api.post('/api/v1/auth/reset-password').send({
        token: 'invalid-reset-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(400);
    });
  });
});
