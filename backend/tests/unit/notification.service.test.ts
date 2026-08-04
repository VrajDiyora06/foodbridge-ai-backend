import { NotificationService } from '../../src/services/notification.service';
import { NotificationRepository } from '../../src/repositories/notification.repository';
import { AppError } from '../../src/utils/appError';
import { createMockNotification, objectId } from '../helpers/testData';

jest.mock('../../src/repositories/notification.repository');
jest.mock('../../src/socket/events/notification.events', () => ({
  emitNotificationRead: jest.fn(),
  emitNotificationDeleted: jest.fn(),
}));
jest.mock('../../src/jobs/queue', () => ({
  addNotificationJob: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('NotificationService', () => {
  let service: NotificationService;
  let mockRepo: jest.Mocked<NotificationRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = new NotificationRepository() as jest.Mocked<NotificationRepository>;
    service = new NotificationService(mockRepo);
  });

  // ── getNotificationById ───────────────────────────────

  describe('getNotificationById', () => {
    it('should return notification when recipient matches', async () => {
      const userId = objectId();
      const notification = createMockNotification({ recipient: userId });
      notification.recipient = { toString: () => userId } as any;
      mockRepo.findById = jest.fn().mockResolvedValue(notification);

      const result = await service.getNotificationById(notification._id, userId);
      expect(result).toEqual(notification);
    });

    it('should throw 404 when notification not found', async () => {
      mockRepo.findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.getNotificationById('missing', objectId()),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 403 when recipient does not match', async () => {
      const notification = createMockNotification();
      notification.recipient = { toString: () => objectId() } as any;
      mockRepo.findById = jest.fn().mockResolvedValue(notification);

      await expect(
        service.getNotificationById(notification._id, 'wrong-user'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  // ── markRead ──────────────────────────────────────────

  describe('markRead', () => {
    it('should mark notification as read', async () => {
      const userId = objectId();
      const notification = createMockNotification({ isRead: true });
      mockRepo.markRead = jest.fn().mockResolvedValue(notification);

      const result = await service.markRead(notification._id, userId);
      expect(result.isRead).toBe(true);
    });

    it('should throw 404 if notification not found or access denied', async () => {
      mockRepo.markRead = jest.fn().mockResolvedValue(null);

      await expect(service.markRead('missing', objectId())).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── markAllRead ───────────────────────────────────────

  describe('markAllRead', () => {
    it('should return count of updated notifications', async () => {
      mockRepo.markAllRead = jest.fn().mockResolvedValue(5);

      const result = await service.markAllRead(objectId());
      expect(result.count).toBe(5);
    });
  });

  // ── deleteNotification ────────────────────────────────

  describe('deleteNotification', () => {
    it('should delete notification for user', async () => {
      mockRepo.delete = jest.fn().mockResolvedValue(true);

      await expect(
        service.deleteNotification(objectId(), objectId()),
      ).resolves.toBeUndefined();
    });

    it('should throw 404 when notification not found', async () => {
      mockRepo.delete = jest.fn().mockResolvedValue(null);

      await expect(
        service.deleteNotification('missing', objectId()),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── broadcastNotification ─────────────────────────────

  describe('broadcastNotification', () => {
    it('should enqueue broadcast job', async () => {
      const { addNotificationJob } = require('../../src/jobs/queue');

      await service.broadcastNotification(objectId(), {
        title: 'System Update',
        message: 'Maintenance tonight',
        type: 'system',
        priority: 'high',
      } as any);

      expect(addNotificationJob).toHaveBeenCalled();
    });
  });
});
