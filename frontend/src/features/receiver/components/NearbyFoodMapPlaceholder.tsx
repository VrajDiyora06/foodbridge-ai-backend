import React from 'react';
import type { FoodItem } from '../../donor/types/donor.types';
import { FoodMap } from '../../maps/components/FoodMap';

interface NearbyFoodMapPlaceholderProps {
  foods: FoodItem[];
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
  onSelectFood?: (food: FoodItem) => void;
}

export const NearbyFoodMapPlaceholder: React.FC<NearbyFoodMapPlaceholderProps> = ({
  foods,
  userLat = 37.7749,
  userLng = -122.4194,
}) => {
  return (
    <FoodMap
      center={{ latitude: userLat, longitude: userLng }}
      userLocation={{ latitude: userLat, longitude: userLng }}
      foods={foods}
      height="h-80"
    />
  );
};
