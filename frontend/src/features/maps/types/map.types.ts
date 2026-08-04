import type { FoodCategory, FoodStatus, FoodItem } from '../../donor/types/donor.types';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapFilterState {
  radiusKm: number;
  category?: FoodCategory;
  status?: FoodStatus;
  isVegetarian?: boolean;
  searchQuery?: string;
}

export interface FoodMapPin {
  id: string;
  food: FoodItem;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}
