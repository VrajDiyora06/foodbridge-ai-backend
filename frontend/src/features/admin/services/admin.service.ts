import { api } from '../../../services/api';
import type { ApiResponse } from '../../../types/auth';
import type { PaginatedFoodResponse } from '../../donor/types/donor.types';
import type { PaginatedReservationResponse } from '../../receiver/types/receiver.types';
import type {
  AdminDashboardData,
  AdminAnalyticsData,
  AdminUser,
  AdminUserFilters,
  PaginatedAdminUsersResponse,
  AdminFoodFilters,
  AdminReservationFilters,
  BroadcastNotificationInput,
  UserRoleType,
  UserStatusType,
} from '../types/admin.types';

export const adminService = {
  /**
   * GET /api/v1/admin/dashboard
   * Fetch high-level admin dashboard statistics.
   */
  async getDashboard(): Promise<AdminDashboardData> {
    const response = await api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard');
    return response.data.data;
  },

  /**
   * GET /api/v1/admin/analytics
   * Fetch time-series and platform analytics metrics.
   */
  async getAnalytics(): Promise<AdminAnalyticsData> {
    const response = await api.get<ApiResponse<AdminAnalyticsData>>('/admin/analytics');
    return response.data.data;
  },

  /**
   * GET /api/v1/admin/users
   * Fetch paginated users list with search & filters.
   */
  async getUsers(filters: AdminUserFilters = {}): Promise<PaginatedAdminUsersResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<ApiResponse<PaginatedAdminUsersResponse>>(`/admin/users?${params.toString()}`);
    return response.data.data;
  },

  /**
   * PATCH /api/v1/users/:id/role
   * Update user access role.
   */
  async updateUserRole(id: string, role: UserRoleType): Promise<AdminUser> {
    const response = await api.patch<ApiResponse<AdminUser>>(`/users/${id}/role`, { role });
    return response.data.data;
  },

  /**
   * PATCH /api/v1/users/:id/status
   * Update user status (active, suspended, inactive).
   */
  async updateUserStatus(id: string, status: UserStatusType): Promise<AdminUser> {
    const response = await api.patch<ApiResponse<AdminUser>>(`/users/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * DELETE /api/v1/users/:id
   * Soft delete user account.
   */
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  /**
   * GET /api/v1/admin/food
   * Fetch food listings for admin moderation.
   */
  async getFoodModeration(filters: AdminFoodFilters = {}): Promise<PaginatedFoodResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get<ApiResponse<PaginatedFoodResponse>>(`/admin/food?${params.toString()}`);
    return response.data.data;
  },

  /**
   * GET /api/v1/admin/reservations
   * Fetch system reservations for admin monitoring.
   */
  async getReservationsMonitoring(filters: AdminReservationFilters = {}): Promise<PaginatedReservationResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get<ApiResponse<PaginatedReservationResponse>>(`/admin/reservations?${params.toString()}`);
    return response.data.data;
  },

  /**
   * POST /api/v1/notifications/broadcast
   * Send platform broadcast notice.
   */
  async broadcastNotification(data: BroadcastNotificationInput): Promise<void> {
    await api.post('/notifications/broadcast', data);
  },
};
