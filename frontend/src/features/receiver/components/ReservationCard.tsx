import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Eye, XCircle } from 'lucide-react';
import type { ReservationItem } from '../types/receiver.types';
import { ReservationStatusBadge } from './ReservationStatusBadge';

interface ReservationCardProps {
  reservation: ReservationItem;
  onCancel?: (id: string) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onCancel,
}) => {
  const food = typeof reservation.food === 'object' ? reservation.food : null;
  const formattedDate = new Date(reservation.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <ReservationStatusBadge status={reservation.status} size="sm" />
          <span className="text-[10px] text-slate-400 font-mono">#{reservation._id.slice(-6)}</span>
        </div>

        {/* Title & Food Info */}
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 hover:text-emerald-600 transition-colors">
            <Link to={`/receiver/reservations/${reservation._id}`}>
              {food ? food.title : 'Food Listing Claim'}
            </Link>
          </h3>
          {food && (
            <p className="text-xs text-slate-500 mt-0.5">
              Quantity: {food.quantity.amount} {food.quantity.unit}
            </p>
          )}
        </div>

        {/* Location & Time */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
          {food && (
            <div className="flex items-center gap-1.5 text-slate-500 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{food.location.city || food.location.address}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Claimed on: {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/receiver/reservations/${reservation._id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </Link>

        {onCancel && (reservation.status === 'pending' || reservation.status === 'accepted') && (
          <button
            type="button"
            onClick={() => onCancel(reservation._id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel Claim
          </button>
        )}
      </div>
    </div>
  );
};
