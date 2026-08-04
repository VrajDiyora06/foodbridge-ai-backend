import { api } from '../../../services/api';
import type { ApiResponse } from '../../../types/auth';
import type { UserProfile, UpdateProfileInput, ChangePasswordInput } from '../types/profile.types';

export const profileService = {
  /**
   * GET /api/v1/users/me
   * Fetch profile of currently authenticated user.
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>('/users/me');
    return response.data.data;
  },

  /**
   * PUT /api/v1/users/me
   * Update profile details.
   */
  async updateProfile(data: UpdateProfileInput): Promise<UserProfile> {
    const response = await api.put<ApiResponse<UserProfile>>('/users/me', data);
    return response.data.data;
  },

  /**
   * Change password via account profile.
   */
  async changePassword(data: ChangePasswordInput): Promise<void> {
    await api.put('/users/me', {
      password: data.newPassword,
    });
  },
};
