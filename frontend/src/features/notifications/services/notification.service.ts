import { api } from '../../../services/api';
import type { ApiResponse } from '../../../types/auth';
import type {
  NotificationItem,
  NotificationFilters,
  PaginatedNotificationResponse,
} from '../types/notification.types';

export const notificationService = {
  /**
   * GET /api/v1/notifications
   * Fetch paginated notification feed for current user.
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<PaginatedNotificationResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.unreadOnly !== undefined) params.append('unreadOnly', filters.unreadOnly.toString());
    if (filters.type) params.append('type', filters.type);

    const response = await api.get<ApiResponse<PaginatedNotificationResponse>>(`/notifications?${params.toString()}`);
    return response.data.data;
  },

  /**
   * GET /api/v1/notifications/:id
   * Fetch details for a single notification.
   */
  async getNotificationById(id: string): Promise<NotificationItem> {
    const response = await api.get<ApiResponse<NotificationItem>>(`/notifications/${id}`);
    return response.data.data;
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  /**
   * DELETE /api/v1/notifications/:id
   * Delete a notification.
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  /**
   * POST /api/v1/notifications/broadcast (Admin)
   * Broadcast a system notice.
   */
  async broadcastNotification(data: {
    title: string;
    message: string;
    targetRoles?: string[];
    priority?: string;
  }): Promise<void> {
    await api.post('/notifications/broadcast', data);
  },
};
