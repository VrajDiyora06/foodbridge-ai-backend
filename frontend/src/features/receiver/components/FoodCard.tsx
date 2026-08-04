import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ShoppingBag } from 'lucide-react';
import type { FoodItem } from '../../donor/types/donor.types';

interface FoodCardProps {
  food: FoodItem;
  onReserve?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onReserve }) => {
  const formattedDate = new Date(food.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4">
      {food.imageUrl && (
        <div className="h-40 -mx-5 -mt-5 mb-1 bg-slate-100 rounded-t-3xl overflow-hidden">
          <img src={food.imageUrl} alt={food.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-3">
        {/* Category & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {food.category.replace('_', ' ')}
          </span>
          {food.isVegetarian && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              🌱 Veg
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 hover:text-emerald-600 transition-colors">
            <Link to={`/receiver/food/${food._id}`}>{food.title}</Link>
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{food.description}</p>
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-400">Available Amount:</span>
            <span className="font-bold text-emerald-700">
              {food.quantity.amount} {food.quantity.unit}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{food.location.city || food.location.address}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Expires: {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/receiver/food/${food._id}`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          View Details
        </Link>

        {onReserve && food.status === 'available' && (
          <button
            type="button"
            onClick={() => onReserve(food)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Claim Food
          </button>
        )}
      </div>
    </div>
  );
};
