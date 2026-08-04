export type NotificationType =
  | 'food_created'
  | 'food_updated'
  | 'food_expired'
  | 'reservation_created'
  | 'reservation_accepted'
  | 'reservation_rejected'
  | 'reservation_cancelled'
  | 'reservation_picked_up'
  | 'reservation_completed'
  | 'system_broadcast'
  | 'general';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  } | string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
  relatedEntityType?: 'food' | 'reservation' | 'user' | 'system';
  isRead: boolean;
  priority: NotificationPriority;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
  search?: string;
}

export interface PaginatedNotificationResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages?: number;
}
