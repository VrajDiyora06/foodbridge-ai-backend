import { useQuery } from '@tanstack/react-query';
import { receiverService } from '../../receiver/services/receiver.service';
import type { LocationCoordinates, MapFilterState } from '../types/map.types';

export const useNearbyFoodMap = (
  coords: LocationCoordinates,
  filters: MapFilterState
) => {
  return useQuery({
    queryKey: ['maps', 'nearby', coords, filters],
    queryFn: async () => {
      const foodItems = await receiverService.getNearbyFood({
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: filters.radiusKm,
        category: filters.category,
      });

      // Filter locally by vegetarian if requested
      if (filters.isVegetarian) {
        return foodItems.filter((item) => item.isVegetarian);
      }

      return foodItems;
    },
    enabled: Boolean(coords.latitude && coords.longitude),
  });
};
