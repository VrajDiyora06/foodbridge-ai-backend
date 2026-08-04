import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import type {
  AdminUserFilters,
  AdminFoodFilters,
  AdminReservationFilters,
  BroadcastNotificationInput,
  UserRoleType,
  UserStatusType,
} from '../types/admin.types';

export const ADMIN_QUERY_KEYS = {
  all: ['admin'] as const,
  dashboard: () => ['admin', 'dashboard'] as const,
  analytics: () => ['admin', 'analytics'] as const,
  users: (filters: AdminUserFilters) => ['admin', 'users', filters] as const,
  food: (filters: AdminFoodFilters) => ['admin', 'food', filters] as const,
  reservations: (filters: AdminReservationFilters) => ['admin', 'reservations', filters] as const,
};

/**
 * Hook to fetch high-level dashboard metrics.
 */
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dashboard(),
    queryFn: () => adminService.getDashboard(),
  });
};

/**
 * Hook to fetch analytics and time-series trends.
 */
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.analytics(),
    queryFn: () => adminService.getAnalytics(),
  });
};

/**
 * Hook to fetch admin user management table.
 */
export const useAdminUsers = (filters: AdminUserFilters = {}) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.users(filters),
    queryFn: () => adminService.getUsers(filters),
  });
};

/**
 * Hook to update user role.
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRoleType }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to update user status.
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatusType }) =>
      adminService.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to soft delete user.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to fetch food moderation queue.
 */
export const useAdminFoodModeration = (filters: AdminFoodFilters = {}) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.food(filters),
    queryFn: () => adminService.getFoodModeration(filters),
  });
};

/**
 * Hook to fetch reservations monitoring feed.
 */
export const useAdminReservations = (filters: AdminReservationFilters = {}) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.reservations(filters),
    queryFn: () => adminService.getReservationsMonitoring(filters),
  });
};

/**
 * Hook to send broadcast notification.
 */
export const useBroadcastNotification = () => {
  return useMutation({
    mutationFn: (data: BroadcastNotificationInput) => adminService.broadcastNotification(data),
  });
};
