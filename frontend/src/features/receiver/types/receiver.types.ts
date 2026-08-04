import type { FoodItem, FoodCategory } from '../../donor/types/donor.types';

export type ReservationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'picked_up'
  | 'completed'
  | 'expired';

export type ClaimerRole = 'user' | 'ngo' | 'volunteer' | 'receiver';

export interface ReservationItem {
  _id: string;
  food: FoodItem | string;
  claimer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    organizationName?: string;
    role: ClaimerRole;
  } | string;
  claimerRole: ClaimerRole;
  status: ReservationStatus;
  pickupTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationFilters {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedReservationResponse {
  data: ReservationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface ReceiverStats {
  totalReservations: number;
  pendingCount: number;
  acceptedCount: number;
  completedCount: number;
  cancelledCount: number;
  rejectedCount: number;
  completionRatePercentage?: number;
}

export interface CreateReservationInput {
  foodId: string;
  notes?: string;
  pickupTime?: string;
}

export interface NearbyFoodFilters {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  city?: string;
  category?: FoodCategory;
}
