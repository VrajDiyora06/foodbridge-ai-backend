import React from 'react';
import type { FoodItem } from '../../donor/types/donor.types';
import { FoodCard } from './FoodCard';

interface FoodGridProps {
  foods: FoodItem[];
  onReserve?: (food: FoodItem) => void;
}

export const FoodGrid: React.FC<FoodGridProps> = ({ foods, onReserve }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {foods.map((food) => (
        <FoodCard key={food._id} food={food} onReserve={onReserve} />
      ))}
    </div>
  );
};
