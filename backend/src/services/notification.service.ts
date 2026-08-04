import { StatusCodes } from 'http-status-codes';
import {
  NotificationRepository,
  notificationRepository as defaultRepo,
  NotificationFilters,
  NotificationPaginationOptions,
  PaginatedNotificationsResult,
} from '../repositories/notification.repository';
import { INotificationDocument } from '../models/notification.model';
import { AppError } from '../utils/appError';
import logger from '../utils/logger';
import { addNotificationJob } from '../jobs/queue';
import { emitNotificationRead, emitNotificationDeleted } from '../socket/events/notification.events';
import { BroadcastNotificationDto } from '../validations/notification.validation';

export class NotificationService {
  private repo: NotificationRepository;

  constructor(repo: NotificationRepository = defaultRepo) {
    this.repo = repo;
  }

  /**
   * Get user notifications with pagination and unread filter.
   */
  async getUserNotifications(
    userId: string,
    filters: NotificationFilters,
    options: NotificationPaginationOptions,
  ): Promise<PaginatedNotificationsResult> {
    return this.repo.findUserNotifications(userId, filters, options);
  }

  /**
   * Get single notification detail by ID (verified recipient).
   */
  async getNotificationById(id: string, userId: string): Promise<INotificationDocument> {
    const notification = await this.repo.findById(id);
    if (!notification) {
      throw new AppError('Notification not found', StatusCodes.NOT_FOUND);
    }
    if (notification.recipient.toString() !== userId) {
      throw new AppError('Unauthorized access to notification', StatusCodes.FORBIDDEN);
    }
    return notification;
  }

  /**
   * Mark notification as read for authenticated user.
   */
  async markRead(id: string, userId: string): Promise<INotificationDocument> {
    const updated = await this.repo.markRead(id, userId);
    if (!updated) {
      throw new AppError('Notification not found or access denied', StatusCodes.NOT_FOUND);
    }
    emitNotificationRead(userId, id);
    return updated;
  }

  /**
   * Mark all notifications as read for user.
   */
  async markAllRead(userId: string): Promise<{ count: number }> {
    const count = await this.repo.markAllRead(userId);
    emitNotificationRead(userId);
    return { count };
  }

  /**
   * Delete a notification document by ID for user.
   */
  async deleteNotification(id: string, userId: string): Promise<void> {
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) {
      throw new AppError('Notification not found or access denied', StatusCodes.NOT_FOUND);
    }
    emitNotificationDeleted(userId, id);
  }

  /**
   * Admin: Enqueue broadcast notification job in background BullMQ queue.
   */
  async broadcastNotification(adminId: string, payload: BroadcastNotificationDto): Promise<void> {
    try {
      await addNotificationJob({
        mode: 'broadcast',
        sender: adminId,
        title: payload.title,
        message: payload.message,
        targetRole: payload.targetRole,
        type: payload.type,
        priority: payload.priority,
      });
      logger.info('Broadcast notification job enqueued by admin', { adminId, targetRole: payload.targetRole });
    } catch (err) {
      logger.error('Failed to enqueue broadcast notification job', { error: (err as Error).message });
      throw new AppError('Failed to queue broadcast notification', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const notificationService = new NotificationService();
