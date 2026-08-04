import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, XCircle, Calendar } from 'lucide-react';
import type { ReservationItem } from '../types/receiver.types';
import { ReservationStatusBadge } from './ReservationStatusBadge';

interface ReservationTableProps {
  reservations: ReservationItem[];
  onCancel?: (id: string) => void;
}

export const ReservationTable: React.FC<ReservationTableProps> = ({
  reservations,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Reservation ID & Food Item</th>
              <th className="py-3.5 px-4">Donor Info</th>
              <th className="py-3.5 px-4">Claimed Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {reservations.map((res) => {
              const food = typeof res.food === 'object' ? res.food : null;
              const formattedDate = new Date(res.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr key={res._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <Link
                        to={`/receiver/reservations/${res._id}`}
                        className="font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                      >
                        {food ? food.title : 'Food Listing Claim'}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: #{res._id.slice(-8)}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {food && typeof food.donor === 'object'
                      ? food.donor.organizationName || food.donor.name
                      : 'Verified Donor'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <ReservationStatusBadge status={res.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/receiver/reservations/${res._id}`}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {onCancel && (res.status === 'pending' || res.status === 'accepted') && (
                        <button
                          type="button"
                          onClick={() => onCancel(res._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Cancel Reservation"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
