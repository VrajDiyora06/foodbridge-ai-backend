import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Edit3, Trash2, Eye } from 'lucide-react';
import type { FoodItem } from '../types/donor.types';
import { DonationStatusBadge } from './DonationStatusBadge';

interface DonationCardProps {
  food: FoodItem;
  onDelete: (id: string) => void;
}

export const DonationCard: React.FC<DonationCardProps> = ({ food, onDelete }) => {
  const formattedDate = new Date(food.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <DonationStatusBadge status={food.status} size="sm" />
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
            {food.category.replace('_', ' ')}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 hover:text-emerald-600 transition-colors">
            <Link to={`/donor/donations/${food._id}`}>{food.title}</Link>
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{food.description}</p>
        </div>

        {/* Quantity & Location */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-400">Quantity:</span>
            <span className="font-semibold text-slate-800">
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

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/donor/donations/${food._id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to={`/donor/donations/${food._id}/edit`}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Donation"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(food._id)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Donation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
