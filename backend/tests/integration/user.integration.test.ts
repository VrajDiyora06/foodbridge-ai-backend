import '../setup/mocks';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/dbSetup';
import { api, authHeader } from '../setup/testHelpers';
import { createUserFixture } from '../setup/fixtures';
import { mockRedis } from '../setup/mocks';
import User, { UserRole, IUserDocument } from '../../src/models/user.model';
import { UserRepository } from '../../src/repositories/user.repository';

describe('Users Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    mockRedis.clear();
    jest.clearAllMocks();

    jest.spyOn(UserRepository.prototype, 'updateProfile').mockImplementation(async (userId, data: any) => {
      const update = data.body || data;
      return User.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean<IUserDocument>();
    });
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // ── Profile ───────────────────────────────────────────

  describe('GET /api/v1/users/me', () => {
    it('should return current authenticated user profile', async () => {
      const user = await createUserFixture({ name: 'Alice Smith' });

      const res = await api
        .get('/api/v1/users/me')
        .set(authHeader(user._id.toString(), UserRole.USER));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Alice Smith');
      expect(res.body.data.email).toBe(user.email);
    });
  });

  // ── Update Profile ────────────────────────────────────

  describe('PUT /api/v1/users/me', () => {
    it('should update profile info successfully', async () => {
      const user = await createUserFixture({ name: 'Alice Smith' });

      const res = await api
        .put('/api/v1/users/me')
        .set(authHeader(user._id.toString(), UserRole.USER))
        .send({
          body: {
            name: 'Alice Johnson',
            phone: '+1-555-0199',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Alice Johnson');
      expect(res.body.data.phone).toBe('+1-555-0199');
    });

    it('should forbid updating protected system fields (role, status)', async () => {
      const user = await createUserFixture({ role: UserRole.USER });

      const res = await api
        .put('/api/v1/users/me')
        .set(authHeader(user._id.toString(), UserRole.USER))
        .send({
          body: {
            role: UserRole.ADMIN,
          },
        });

      expect(res.status).toBe(400);
    });
  });
});
