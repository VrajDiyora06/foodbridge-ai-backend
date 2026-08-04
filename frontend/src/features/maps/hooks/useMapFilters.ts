import { useState } from 'react';
import type { MapFilterState } from '../types/map.types';

export const useMapFilters = (initialRadius = 10) => {
  const [filters, setFilters] = useState<MapFilterState>({
    radiusKm: initialRadius,
    status: 'available',
  });

  const resetFilters = () => {
    setFilters({ radiusKm: initialRadius, status: 'available' });
  };

  return { filters, setFilters, resetFilters };
};
