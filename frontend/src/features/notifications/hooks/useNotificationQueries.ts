import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import type { NotificationFilters } from '../types/notification.types';

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  feed: (filters: NotificationFilters) => ['notifications', 'feed', filters] as const,
  detail: (id: string) => ['notifications', 'detail', id] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
};

/**
 * Hook to fetch paginated notification feed.
 */
export const useNotifications = (filters: NotificationFilters = {}) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.feed(filters),
    queryFn: () => notificationService.getNotifications(filters),
  });
};

/**
 * Hook to fetch single notification detail.
 */
export const useNotification = (id: string) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.detail(id),
    queryFn: () => notificationService.getNotificationById(id),
    enabled: Boolean(id),
  });
};

/**
 * Hook to fetch unread notifications count.
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: async () => {
      const res = await notificationService.getNotifications({ limit: 1, unreadOnly: true });
      return res.unreadCount;
    },
    refetchInterval: 30000, // Poll fallback every 30 seconds
  });
};

/**
 * Hook to mark single notification as read.
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to mark all notifications as read.
 */
export const useMarkAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to delete a notification.
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};
