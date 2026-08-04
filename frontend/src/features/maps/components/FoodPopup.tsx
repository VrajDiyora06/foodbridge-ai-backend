import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ShoppingBag } from 'lucide-react';
import type { FoodItem } from '../../donor/types/donor.types';

interface FoodPopupProps {
  food: FoodItem;
}

export const FoodPopup: React.FC<FoodPopupProps> = ({ food }) => {
  return (
    <div className="p-1 max-w-xs space-y-2 text-slate-900 font-sans">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          {food.category.replace('_', ' ')}
        </span>
        {food.isVegetarian && (
          <span className="text-[10px] font-semibold text-emerald-700">🌱 Veg</span>
        )}
      </div>

      <div>
        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{food.title}</h4>
        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{food.description}</p>
      </div>

      <div className="text-[11px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Quantity:</span>
          <span className="font-bold text-emerald-700">
            {food.quantity.amount} {food.quantity.unit}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
          <span className="truncate">{food.location.city || food.location.address}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
          <span>Expires: {new Date(food.expiresAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/receiver/food/${food._id}`}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-all shadow-xs"
        >
          <ShoppingBag className="w-3 h-3" />
          View Details
        </Link>
      </div>
    </div>
  );
};
