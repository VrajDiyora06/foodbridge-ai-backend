import { api } from '../../../services/api';
import type { ApiResponse } from '../../../types/auth';
import type { FoodItem, FoodFilters, PaginatedFoodResponse } from '../../donor/types/donor.types';
import type {
  ReservationItem,
  ReservationFilters,
  PaginatedReservationResponse,
  ReceiverStats,
  CreateReservationInput,
  NearbyFoodFilters,
} from '../types/receiver.types';

export const receiverService = {
  /**
   * GET /api/v1/food
   * Browse all available food listings with search & filters.
   */
  async getAvailableFood(filters: FoodFilters = {}): Promise<PaginatedFoodResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<ApiResponse<PaginatedFoodResponse>>(`/food?${params.toString()}`);
    return response.data.data;
  },

  /**
   * GET /api/v1/food/nearby
   * Fetch nearby food listings based on coordinates & radius.
   */
  async getNearbyFood(filters: NearbyFoodFilters = {}): Promise<FoodItem[]> {
    const params = new URLSearchParams();
    if (filters.latitude) params.append('latitude', filters.latitude.toString());
    if (filters.longitude) params.append('longitude', filters.longitude.toString());
    if (filters.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.category) params.append('category', filters.category);

    const response = await api.get<ApiResponse<FoodItem[]>>(`/food/nearby?${params.toString()}`);
    return response.data.data;
  },

  /**
   * GET /api/v1/food/:id
   * Fetch food listing details.
   */
  async getFoodById(id: string): Promise<FoodItem> {
    const response = await api.get<ApiResponse<FoodItem>>(`/food/${id}`);
    return response.data.data;
  },

  /**
   * POST /api/v1/reservations
   * Create a reservation claim for a food listing.
   */
  async createReservation(data: CreateReservationInput): Promise<ReservationItem> {
    const response = await api.post<ApiResponse<ReservationItem>>('/reservations', {
      food: data.foodId,
      notes: data.notes,
      pickupTime: data.pickupTime,
    });
    return response.data.data;
  },

  /**
   * GET /api/v1/reservations/my
   * Fetch receiver's reservations with pagination and status filters.
   */
  async getMyReservations(filters: ReservationFilters = {}): Promise<PaginatedReservationResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<ApiResponse<PaginatedReservationResponse>>(`/reservations/my?${params.toString()}`);
    return response.data.data;
  },

  /**
   * GET /api/v1/reservations/my/statistics
   * Fetch receiver reservation summary statistics.
   */
  async getMyStatistics(): Promise<ReceiverStats> {
    const response = await api.get<ApiResponse<ReceiverStats>>('/reservations/my/statistics');
    return response.data.data;
  },

  /**
   * GET /api/v1/reservations/:id
   * Fetch single reservation details.
   */
  async getReservationById(id: string): Promise<ReservationItem> {
    const response = await api.get<ApiResponse<ReservationItem>>(`/reservations/${id}`);
    return response.data.data;
  },

  /**
   * PATCH /api/v1/reservations/:id/cancel
   * Cancel pending or accepted reservation claim.
   */
  async cancelReservation(id: string, reason?: string): Promise<void> {
    await api.patch(`/reservations/${id}/cancel`, { reason });
  },
};
