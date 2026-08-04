import { z } from 'zod';
import { NotificationType, NotificationPriority } from '../models/notification.model';
import { UserRole } from '../models/user.model';

export const notificationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    unreadOnly: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    type: z.nativeEnum(NotificationType).optional(),
  }),
});

export const broadcastNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(120, 'Title cannot exceed 120 characters'),
    message: z.string().min(5, 'Message must be at least 5 characters').max(500, 'Message cannot exceed 500 characters'),
    targetRole: z.union([z.enum(['all']), z.nativeEnum(UserRole)], {
      errorMap: () => ({ message: "targetRole must be 'all' or a valid role (donor, ngo, volunteer, user, admin)" }),
    }),
    type: z.nativeEnum(NotificationType).optional().default(NotificationType.SYSTEM),
    priority: z.nativeEnum(NotificationPriority).optional().default(NotificationPriority.HIGH),
  }),
});

export type NotificationQueryDto = z.infer<typeof notificationQuerySchema>['query'];
export type BroadcastNotificationDto = z.infer<typeof broadcastNotificationSchema>['body'];
