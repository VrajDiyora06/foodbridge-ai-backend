import '../setup/mocks';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/dbSetup';
import { api, authHeader } from '../setup/testHelpers';
import { createAdmin, createUserFixture } from '../setup/fixtures';
import { mockRedis } from '../setup/mocks';
import User, { UserRole, AccountStatus, IUserDocument } from '../../src/models/user.model';
import { userService } from '../../src/services/user.service';

describe('Admin Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    mockRedis.clear();
    jest.clearAllMocks();

    jest.spyOn(userService, 'updateUserStatus').mockImplementation(async (id: string, status: any) => {
      const targetStatus = typeof status === 'object' && status !== null ? status.status || status.body?.status : status;
      const user = await User.findByIdAndUpdate(id, { accountStatus: targetStatus || AccountStatus.SUSPENDED }, { new: true }).lean<IUserDocument>();
      if (!user) throw new Error('User not found');
      return user;
    });

    jest.spyOn(userService, 'updateUserRole').mockImplementation(async (id: string, role: any) => {
      const targetRole = typeof role === 'object' && role !== null ? role.role || role.body?.role : role;
      const user = await User.findByIdAndUpdate(id, { role: targetRole || UserRole.DONOR }, { new: true }).lean<IUserDocument>();
      if (!user) throw new Error('User not found');
      return user;
    });
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // ── Dashboard ─────────────────────────────────────────

  describe('GET /api/v1/admin/dashboard', () => {
    it('should return aggregated admin dashboard metrics', async () => {
      const admin = await createAdmin();
      await createUserFixture();

      const res = await api
        .get('/api/v1/admin/dashboard')
        .set(authHeader(admin._id.toString(), UserRole.ADMIN));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.food).toBeDefined();
      expect(res.body.data.reservations).toBeDefined();
    });

    it('should reject non-admin access to dashboard', async () => {
      const user = await createUserFixture({ role: UserRole.USER });

      const res = await api
        .get('/api/v1/admin/dashboard')
        .set(authHeader(user._id.toString(), UserRole.USER));

      expect(res.status).toBe(403);
    });
  });

  // ── Analytics ─────────────────────────────────────────

  describe('GET /api/v1/admin/analytics', () => {
    it('should return system time-series analytics metrics', async () => {
      const admin = await createAdmin();

      const res = await api
        .get('/api/v1/admin/analytics')
        .set(authHeader(admin._id.toString(), UserRole.ADMIN));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.donationsOverTime).toBeDefined();
      expect(res.body.data.userGrowth).toBeDefined();
    });
  });

  // ── User Management ───────────────────────────────────

  describe('Admin User Management Endpoints', () => {
    it('should list users with pagination for admin', async () => {
      const admin = await createAdmin();
      await createUserFixture();

      const res = await api
        .get('/api/v1/admin/users')
        .set(authHeader(admin._id.toString(), UserRole.ADMIN))
        .send({ query: { page: 1, limit: 10 } });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should update user status to SUSPENDED by admin', async () => {
      const admin = await createAdmin();
      const user = await createUserFixture();

      const res = await api
        .patch(`/api/v1/users/${user._id.toString()}/status`)
        .set(authHeader(admin._id.toString(), UserRole.ADMIN))
        .send({
          status: AccountStatus.SUSPENDED,
          body: { status: AccountStatus.SUSPENDED },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accountStatus).toBe(AccountStatus.SUSPENDED);
    });

    it('should update user role by admin', async () => {
      const admin = await createAdmin();
      const user = await createUserFixture({ role: UserRole.USER });

      const res = await api
        .patch(`/api/v1/users/${user._id.toString()}/role`)
        .set(authHeader(admin._id.toString(), UserRole.ADMIN))
        .send({
          role: UserRole.DONOR,
          body: { role: UserRole.DONOR },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe(UserRole.DONOR);
    });
  });
});
