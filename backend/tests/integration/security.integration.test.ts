import jwt from 'jsonwebtoken';
import '../setup/mocks';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/dbSetup';
import { api, authHeader } from '../setup/testHelpers';
import { createUserFixture, createDonor, TEST_PASSWORD } from '../setup/fixtures';
import { mockRedis } from '../setup/mocks';
import { UserRole } from '../../src/models/user.model';
import { env } from '../../src/config';

describe('Security Integration Tests', () => {
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

  // ── Unauthorized Request ──────────────────────────────

  describe('Unauthorized Request (Missing Token)', () => {
    it('should return 401 Unauthorized when Bearer token is missing', async () => {
      const res = await api.get('/api/v1/users/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Invalid JWT ───────────────────────────────────────

  describe('Invalid JWT Signature / Malformed Token', () => {
    it('should return 401 Unauthorized for malformed JWT token', async () => {
      const res = await api
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid.garbage.jwttoken');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for token signed with wrong secret', async () => {
      const fakeToken = jwt.sign({ userId: '123', role: 'user' }, 'wrong-secret-key');

      const res = await api
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Expired JWT ───────────────────────────────────────

  describe('Expired JWT', () => {
    it('should return 401 Unauthorized for an expired access token', async () => {
      const user = await createUserFixture();
      const expiredToken = jwt.sign(
        { userId: user._id.toString(), role: user.role, jti: 'expired-jti' },
        env.jwtSecret,
        { expiresIn: '-1s' },
      );

      const res = await api
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Wrong Role ────────────────────────────────────────

  describe('Wrong Role Authorization Guard', () => {
    it('should return 403 Forbidden when regular user accesses admin route', async () => {
      const user = await createUserFixture({ role: UserRole.USER });

      const res = await api
        .get('/api/v1/admin/dashboard')
        .set(authHeader(user._id.toString(), UserRole.USER));

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Invalid Payload & Missing Fields ──────────────────

  describe('Invalid Payload & Missing Fields Validation', () => {
    it('should return 400 Bad Request when required body fields are missing', async () => {
      const res = await api.post('/api/v1/auth/register').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 Bad Request when invalid types/formats are sent', async () => {
      const res = await api.post('/api/v1/auth/login').send({
        email: 'invalid-email-format',
        password: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Duplicate Email ───────────────────────────────────

  describe('Duplicate Email Conflict', () => {
    it('should return 409 Conflict when attempting to register existing email', async () => {
      await createDonor({ email: 'taken@example.com' });

      const res = await api.post('/api/v1/auth/register').send({
        name: 'Another User',
        email: 'taken@example.com',
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        role: UserRole.DONOR,
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });
});
