import '../setup/mocks';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/dbSetup';
import { api, authHeader } from '../setup/testHelpers';
import { createUserFixture, createAdmin } from '../setup/fixtures';
import { mockRedis } from '../setup/mocks';
import Notification, { NotificationType, NotificationPriority } from '../../src/models/notification.model';
import { UserRole } from '../../src/models/user.model';
import { NotificationService } from '../../src/services/notification.service';

describe('Notifications Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    mockRedis.clear();
    jest.clearAllMocks();

    jest.spyOn(NotificationService.prototype, 'broadcastNotification').mockResolvedValue(10 as any);
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // ── Fetch Notifications ───────────────────────────────

  describe('GET /api/v1/notifications', () => {
    it('should retrieve authenticated user notifications', async () => {
      const user = await createUserFixture();

      await Notification.create({
        recipient: user._id,
        title: 'Welcome Notification',
        message: 'Welcome to FoodBridge AI',
        type: NotificationType.INFO,
        priority: NotificationPriority.MEDIUM,
      });

      const res = await api
        .get('/api/v1/notifications')
        .set(authHeader(user._id.toString(), UserRole.USER))
        .send({ query: { page: 1, limit: 10 } });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Welcome Notification');
    });
  });

  // ── Mark Read ─────────────────────────────────────────

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const user = await createUserFixture();

      const notif = await Notification.create({
        recipient: user._id,
        title: 'Unread Notice',
        message: 'Please read this',
        type: NotificationType.SYSTEM,
        isRead: false,
      });

      const res = await api
        .patch(`/api/v1/notifications/${notif._id.toString()}/read`)
        .set(authHeader(user._id.toString(), UserRole.USER));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
    });
  });

  // ── Delete Notification ───────────────────────────────

  describe('DELETE /api/v1/notifications/:id', () => {
    it('should delete notification by ID', async () => {
      const user = await createUserFixture();

      const notif = await Notification.create({
        recipient: user._id,
        title: 'Delete Notice',
        message: 'To be deleted',
        type: NotificationType.INFO,
      });

      const res = await api
        .delete(`/api/v1/notifications/${notif._id.toString()}`)
        .set(authHeader(user._id.toString(), UserRole.USER));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── Broadcast Notification ─────────────────────────────

  describe('POST /api/v1/notifications/broadcast', () => {
    it('should allow admin to broadcast notification', async () => {
      const admin = await createAdmin();

      const payload = {
        body: {
          title: 'Platform Maintenance',
          message: 'Scheduled downtime tonight at 12 PM UTC.',
          targetRole: 'all',
          type: NotificationType.SYSTEM,
          priority: NotificationPriority.HIGH,
        },
      };

      const res = await api
        .post('/api/v1/notifications/broadcast')
        .set(authHeader(admin._id.toString(), UserRole.ADMIN))
        .send(payload);

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
    });

    it('should forbid non-admin from broadcasting', async () => {
      const user = await createUserFixture({ role: UserRole.USER });

      const payload = {
        body: {
          title: 'Fake Broadcast',
          message: 'Fake message',
          targetRole: 'all',
        },
      };

      const res = await api
        .post('/api/v1/notifications/broadcast')
        .set(authHeader(user._id.toString(), UserRole.USER))
        .send(payload);

      expect(res.status).toBe(403);
    });
  });
});
