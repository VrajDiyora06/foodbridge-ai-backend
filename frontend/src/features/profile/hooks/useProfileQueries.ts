import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';
import type { UpdateProfileInput, ChangePasswordInput } from '../types/profile.types';


export const PROFILE_QUERY_KEYS = {
  me: ['profile', 'me'] as const,
};

/**
 * Hook to fetch profile details.
 */
export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.me,
    queryFn: () => profileService.getProfile(),
  });
};

/**
 * Hook to update user profile with optimistic updates.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => profileService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.me, updatedProfile);
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.me });
    },
  });
};

/**
 * Hook to change password.
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => profileService.changePassword(data),
  });
};
