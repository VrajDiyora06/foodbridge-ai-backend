import { api } from '../../../services/api';
import type { ApiResponse } from '../../../types/auth';
import type {
  FoodItem,
  FoodFilters,
  PaginatedFoodResponse,
  DonorStats,
  CreateFoodInput,
  UpdateFoodInput,
} from '../types/donor.types';

export const donorService = {
  /**
   * GET /api/v1/food/my
   * Fetch donor's own listings with filtering and pagination.
   */
  async getMyDonations(filters: FoodFilters = {}): Promise<PaginatedFoodResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<ApiResponse<PaginatedFoodResponse>>(`/food/my?${params.toString()}`);
    return response.data.data;
  },

  /**
   * GET /api/v1/food/my/statistics
   * Fetch donor donation statistics summary.
   */
  async getMyStatistics(): Promise<DonorStats> {
    const response = await api.get<ApiResponse<DonorStats>>('/food/my/statistics');
    return response.data.data;
  },

  /**
   * GET /api/v1/food/:id
   * Fetch single food listing details.
   */
  async getFoodById(id: string): Promise<FoodItem> {
    const response = await api.get<ApiResponse<FoodItem>>(`/food/${id}`);
    return response.data.data;
  },

  /**
   * POST /api/v1/food
   * Create a new food donation listing.
   */
  async createFood(data: CreateFoodInput): Promise<FoodItem> {
    const response = await api.post<ApiResponse<FoodItem>>('/food', data);
    return response.data.data;
  },

  /**
   * PUT /api/v1/food/:id
   * Update an existing food donation listing.
   */
  async updateFood(id: string, data: UpdateFoodInput): Promise<FoodItem> {
    const response = await api.put<ApiResponse<FoodItem>>(`/food/${id}`, data);
    return response.data.data;
  },

  /**
   * DELETE /api/v1/food/:id
   * Delete a food donation listing.
   */
  async deleteFood(id: string): Promise<void> {
    await api.delete(`/food/${id}`);
  },

  /**
   * PATCH /api/v1/reservations/:id/accept
   * Donor accepts pending reservation claim.
   */
  async acceptReservation(reservationId: string): Promise<void> {
    await api.patch(`/reservations/${reservationId}/accept`);
  },

  /**
   * PATCH /api/v1/reservations/:id/reject
   * Donor rejects pending reservation claim.
   */
  async rejectReservation(reservationId: string, reason?: string): Promise<void> {
    await api.patch(`/reservations/${reservationId}/reject`, { reason });
  },

  /**
   * PATCH /api/v1/reservations/:id/pickup
   * Donor marks food picked up by claimer.
   */
  async markPickedUp(reservationId: string): Promise<void> {
    await api.patch(`/reservations/${reservationId}/pickup`);
  },

  /**
   * PATCH /api/v1/reservations/:id/complete
   * Donor marks reservation completed / delivered.
   */
  async markCompleted(reservationId: string): Promise<void> {
    await api.patch(`/reservations/${reservationId}/complete`);
  },
};
