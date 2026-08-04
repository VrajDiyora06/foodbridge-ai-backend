import type { FoodCategory, FoodStatus } from '../../donor/types/donor.types';
import type { ReservationStatus } from '../../receiver/types/receiver.types';

export type UserRoleType = 'user' | 'donor' | 'ngo' | 'volunteer' | 'admin';
export type UserStatusType = 'active' | 'inactive' | 'suspended';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRoleType;
  status: UserStatusType;
  phone?: string;
  organizationName?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserFilters {
  page?: number;
  limit?: number;
  role?: UserRoleType;
  status?: UserStatusType;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface AdminDashboardData {
  users: {
    total: number;
    donors: number;
    ngos: number;
    volunteers: number;
    regularUsers: number;
  };
  food: {
    total: number;
    available: number;
    reserved: number;
    completed: number;
    expired: number;
  };
  reservations: {
    total: number;
    pending: number;
    accepted: number;
    completed: number;
    cancelled: number;
  };
  recentActivities?: Array<{
    id: string;
    description: string;
    timestamp: string;
    type: 'user' | 'food' | 'reservation';
  }>;
}

export interface AdminAnalyticsData {
  dailyDonations: Array<{ date: string; count: number }>;
  monthlyDonations: Array<{ month: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  reservationTrends: Array<{ date: string; count: number }>;
  completionRatePercentage: number;
}

export interface AdminFoodFilters {
  page?: number;
  limit?: number;
  status?: FoodStatus;
  category?: FoodCategory;
  search?: string;
}

export interface AdminReservationFilters {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  search?: string;
}

export interface BroadcastNotificationInput {
  title: string;
  message: string;
  targetRoles?: UserRoleType[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
