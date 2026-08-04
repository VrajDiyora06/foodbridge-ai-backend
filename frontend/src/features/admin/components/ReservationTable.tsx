import React from 'react';
import { Calendar } from 'lucide-react';
import type { ReservationItem } from '../../receiver/types/receiver.types';
import { ReservationStatusBadge } from '../../receiver/components/ReservationStatusBadge';

interface AdminReservationTableProps {
  reservations: ReservationItem[];
}

export const ReservationTable: React.FC<AdminReservationTableProps> = ({ reservations }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Reservation ID & Food Item</th>
              <th className="py-3.5 px-4">Claimer Info</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Claimed Date</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {reservations.map((res) => {
              const food = typeof res.food === 'object' ? res.food : null;
              const claimer = typeof res.claimer === 'object' ? res.claimer : null;

              return (
                <tr key={res._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {food ? food.title : 'Food Listing Claim'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: #{res._id.slice(-8)}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {claimer ? claimer.name : 'Registered Claimer'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {claimer ? claimer.email : ''}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-700 capitalize">
                    {res.claimerRole}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <ReservationStatusBadge status={res.status} size="sm" />
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
