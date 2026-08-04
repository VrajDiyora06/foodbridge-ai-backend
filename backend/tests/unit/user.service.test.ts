import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { AccountStatus, UserRole } from '../../src/models/user.model';
import { AppError } from '../../src/utils/appError';
import { createMockUser, objectId } from '../helpers/testData';

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
    mockRepo = (service as any).userRepo;
  });

  // ── getProfile ────────────────────────────────────────

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = createMockUser();
      mockRepo.findById = jest.fn().mockResolvedValue(user);

      const result = await service.getProfile(user._id);
      expect(result).toEqual(user);
    });

    it('should throw 404 when profile not found', async () => {
      mockRepo.findById = jest.fn().mockResolvedValue(null);

      await expect(service.getProfile('missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── updateProfile ─────────────────────────────────────

  describe('updateProfile', () => {
    it('should update and return updated user', async () => {
      const user = createMockUser({ name: 'Updated Name' });
      mockRepo.updateProfile = jest.fn().mockResolvedValue(user);

      const result = await service.updateProfile(user._id, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw 404 when user not found', async () => {
      mockRepo.updateProfile = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateProfile('missing', { name: 'Test' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── updateUserStatus ──────────────────────────────────

  describe('updateUserStatus', () => {
    it('should update account status', async () => {
      const user = createMockUser({ accountStatus: AccountStatus.SUSPENDED });
      mockRepo.updateStatus = jest.fn().mockResolvedValue(user);

      const result = await service.updateUserStatus(user._id, AccountStatus.SUSPENDED);
      expect(result.accountStatus).toBe(AccountStatus.SUSPENDED);
    });

    it('should throw 404 when user not found', async () => {
      mockRepo.updateStatus = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateUserStatus('missing', AccountStatus.ACTIVE),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── updateUserRole ────────────────────────────────────

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const user = createMockUser({ role: UserRole.NGO });
      mockRepo.updateRole = jest.fn().mockResolvedValue(user);

      const result = await service.updateUserRole(user._id, UserRole.NGO);
      expect(result.role).toBe(UserRole.NGO);
    });

    it('should throw 404 when user not found', async () => {
      mockRepo.updateRole = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateUserRole('missing', UserRole.ADMIN),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── deleteUser ────────────────────────────────────────

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      mockRepo.softDelete = jest.fn().mockResolvedValue(createMockUser());

      await expect(service.deleteUser(objectId())).resolves.toBeUndefined();
    });

    it('should throw 404 when user not found', async () => {
      mockRepo.softDelete = jest.fn().mockResolvedValue(null);

      await expect(service.deleteUser('missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── getUsersPaginated ─────────────────────────────────

  describe('getUsersPaginated', () => {
    it('should delegate to repository with filters and options', async () => {
      const paginatedResult = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockRepo.findPaginated = jest.fn().mockResolvedValue(paginatedResult);

      const result = await service.getUsersPaginated({}, { page: 1, limit: 10 });
      expect(result).toEqual(paginatedResult);
      expect(mockRepo.findPaginated).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
    });
  });
});
