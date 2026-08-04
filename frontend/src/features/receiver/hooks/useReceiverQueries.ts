import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receiverService } from '../services/receiver.service';
import type { FoodFilters } from '../../donor/types/donor.types';
import type {
  ReservationFilters,
  CreateReservationInput,
  NearbyFoodFilters,
} from '../types/receiver.types';

export const RECEIVER_QUERY_KEYS = {
  all: ['receiver'] as const,
  availableFood: (filters: FoodFilters) => ['receiver', 'available-food', filters] as const,
  nearbyFood: (filters: NearbyFoodFilters) => ['receiver', 'nearby-food', filters] as const,
  foodDetail: (id: string) => ['receiver', 'food-detail', id] as const,
  reservations: (filters: ReservationFilters) => ['receiver', 'reservations', filters] as const,
  reservationDetail: (id: string) => ['receiver', 'reservation', id] as const,
  statistics: () => ['receiver', 'statistics'] as const,
};

/**
 * Hook to fetch available food listings catalog.
 */
export const useAvailableFood = (filters: FoodFilters = {}) => {
  return useQuery({
    queryKey: RECEIVER_QUERY_KEYS.availableFood(filters),
    queryFn: () => receiverService.getAvailableFood(filters),
  });
};

/**
 * Hook to fetch nearby food listings.
 */
export const useNearbyFood = (filters: NearbyFoodFilters = {}) => {
  return useQuery({
    queryKey: RECEIVER_QUERY_KEYS.nearbyFood(filters),
    queryFn: () => receiverService.getNearbyFood(filters),
  });
};

/**
 * Hook to fetch food details.
 */
export const useFoodDetail = (id: string) => {
  return useQuery({
    queryKey: RECEIVER_QUERY_KEYS.foodDetail(id),
    queryFn: () => receiverService.getFoodById(id),
    enabled: Boolean(id),
  });
};

/**
 * Hook to fetch receiver's reservations list.
 */
export const useReservations = (filters: ReservationFilters = {}) => {
  return useQuery({
    queryKey: RECEIVER_QUERY_KEYS.reservations(filters),
    queryFn: () => receiverService.getMyReservations(filters),
  });
};

/**
 * Hook to fetch single reservation details.
 */
export const useReservation = (id: string) => {
  return useQuery({
    queryKey: RECEIVER_QUERY_KEYS.reservationDetail(id),
    queryFn: () => receiverService.getReservationById(id),
    enabled: Boolean(id),
  });
};

/**
 * Hook to fetch receiver statistics.
 */
export const useReservationStatistics = () => {
  return useQuery({
    queryKey: RECEIVER_QUERY_KEYS.statistics(),
    queryFn: () => receiverService.getMyStatistics(),
  });
};

/**
 * Hook to create a reservation claim.
 */
export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationInput) => receiverService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECEIVER_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook to cancel a reservation claim.
 */
export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      receiverService.cancelReservation(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECEIVER_QUERY_KEYS.all });
    },
  });
};
