import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donorService } from '../services/donor.service';
import type {
  FoodFilters,
  CreateFoodInput,
  UpdateFoodInput,
} from '../types/donor.types';

export const DONOR_QUERY_KEYS = {
  all: ['donor'] as const,
  donations: (filters: FoodFilters) => ['donor', 'donations', filters] as const,
  donation: (id: string) => ['donor', 'donation', id] as const,
  statistics: () => ['donor', 'statistics'] as const,
};

/**
 * Hook to fetch paginated list of donor's food listings.
 */
export const useDonations = (filters: FoodFilters = {}) => {
  return useQuery({
    queryKey: DONOR_QUERY_KEYS.donations(filters),
    queryFn: () => donorService.getMyDonations(filters),
  });
};

/**
 * Hook to fetch details for a single food donation.
 */
export const useDonation = (id: string) => {
  return useQuery({
    queryKey: DONOR_QUERY_KEYS.donation(id),
    queryFn: () => donorService.getFoodById(id),
    enabled: Boolean(id),
  });
};

/**
 * Hook to fetch donor statistics.
 */
export const useStatistics = () => {
  return useQuery({
    queryKey: DONOR_QUERY_KEYS.statistics(),
    queryFn: () => donorService.getMyStatistics(),
  });
};

/**
 * Hook to create a new food donation listing.
 */
export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFoodInput) => donorService.createFood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DONOR_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to update an existing food donation listing.
 */
export const useUpdateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFoodInput }) =>
      donorService.updateFood(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DONOR_QUERY_KEYS.donation(variables.id) });
      queryClient.invalidateQueries({ queryKey: DONOR_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to delete a food donation listing.
 */
export const useDeleteDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => donorService.deleteFood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DONOR_QUERY_KEYS.all });
    },
  });
};

/**
 * Hooks for reservation status transitions.
 */
export const useAcceptReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => donorService.acceptReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DONOR_QUERY_KEYS.all });
    },
  });
};

export const useRejectReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: string; reason?: string }) =>
      donorService.rejectReservation(reservationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DONOR_QUERY_KEYS.all });
    },
  });
};

export const useMarkPickedUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => donorService.markPickedUp(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DONOR_QUERY_KEYS.all });
    },
  });
};

export const useMarkCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => donorService.markCompleted(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DONOR_QUERY_KEYS.all });
    },
  });
};
