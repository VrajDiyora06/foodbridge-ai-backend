import { Types } from 'mongoose';
import Notification, {
  INotificationDocument,
  NotificationType,
  NotificationPriority,
} from '../models/notification.model';
import User, { UserRole } from '../models/user.model';

export interface CreateNotificationData {
  recipient: string | Types.ObjectId;
  sender?: string | Types.ObjectId | null;
  title: string;
  message: string;
  type?: NotificationType;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
  priority?: NotificationPriority;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface NotificationPaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationsResult {
  data: INotificationDocument[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class NotificationRepository {
  /**
   * Create single notification document.
   */
  async create(data: CreateNotificationData): Promise<INotificationDocument> {
    return Notification.create({
      recipient: data.recipient,
      sender: data.sender || null,
      title: data.title,
      message: data.message,
      type: data.type || NotificationType.INFO,
      relatedEntityId: data.relatedEntityId || null,
      relatedEntityType: data.relatedEntityType || null,
      priority: data.priority || NotificationPriority.MEDIUM,
    });
  }

  /**
   * Find notification by ID.
   */
  async findById(id: string): Promise<INotificationDocument | null> {
    return Notification.findById(id).populate('sender', 'name avatar email').lean<INotificationDocument>();
  }

  /**
   * Paginated listing for a specific recipient user.
   */
  async findUserNotifications(
    userId: string,
    filters: NotificationFilters = {},
    options: NotificationPaginationOptions = {},
  ): Promise<PaginatedNotificationsResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      recipient: new Types.ObjectId(userId),
    };

    if (filters.unreadOnly) {
      query.isRead = false;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    const [data, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name avatar email')
        .lean<INotificationDocument[]>(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: new Types.ObjectId(userId), isRead: false }),
    ]);

    return {
      data,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Mark notification as read for recipient.
   */
  async markRead(id: string, userId: string): Promise<INotificationDocument | null> {
    return Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { $set: { isRead: true } },
      { new: true },
    ).lean<INotificationDocument>();
  }

  /**
   * Mark all unread notifications as read for recipient.
   */
  async markAllRead(userId: string): Promise<number> {
    const res = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );
    return res.modifiedCount;
  }

  /**
   * Delete notification document by ID for user.
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const res = await Notification.deleteOne({ _id: id, recipient: userId });
    return res.deletedCount > 0;
  }

  /**
   * Broadcast notification to multiple user IDs or target role.
   */
  async broadcast(
    targetRole: 'all' | UserRole,
    payload: { title: string; message: string; type?: NotificationType; priority?: NotificationPriority },
    senderId?: string,
  ): Promise<number> {
    const userQuery: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (targetRole !== 'all') {
      userQuery.role = targetRole;
    }

    const users = await User.find(userQuery, '_id').lean();
    if (users.length === 0) return 0;

    const docs = users.map((u) => ({
      recipient: u._id,
      sender: senderId ? new Types.ObjectId(senderId) : null,
      title: payload.title,
      message: payload.message,
      type: payload.type || NotificationType.SYSTEM,
      priority: payload.priority || NotificationPriority.HIGH,
    }));

    const result = await Notification.insertMany(docs);
    return result.length;
  }
}

export const notificationRepository = new NotificationRepository();
