import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, Calendar, MapPin } from 'lucide-react';
import type { FoodItem } from '../types/donor.types';
import { DonationStatusBadge } from './DonationStatusBadge';

interface DonationTableProps {
  donations: FoodItem[];
  onDelete: (id: string) => void;
}

export const DonationTable: React.FC<DonationTableProps> = ({ donations, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Title & Category</th>
              <th className="py-3.5 px-4">Quantity</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Expires</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {donations.map((food) => {
              const formattedDate = new Date(food.expiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr key={food._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <Link
                        to={`/donor/donations/${food._id}`}
                        className="font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                      >
                        {food.title}
                      </Link>
                      <div className="text-[10px] text-slate-500 capitalize mt-0.5">
                        {food.category.replace('_', ' ')}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {food.quantity.amount} {food.quantity.unit}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1 max-w-[150px] truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{food.location.city || food.location.address}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <DonationStatusBadge status={food.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/donor/donations/${food._id}`}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/donor/donations/${food._id}/edit`}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(food._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
