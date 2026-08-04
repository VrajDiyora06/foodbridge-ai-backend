import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import type { FoodItem } from '../../donor/types/donor.types';
import { DonationStatusBadge } from '../../donor/components/DonationStatusBadge';

interface FoodModerationTableProps {
  foods: FoodItem[];
}

export const FoodModerationTable: React.FC<FoodModerationTableProps> = ({ foods }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Title & Donor</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Quantity</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {foods.map((food) => {
              const donor = typeof food.donor === 'object' ? food.donor : null;
              return (
                <tr key={food._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-slate-900 block">{food.title}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Donor: {donor ? donor.organizationName || donor.name : 'Verified Donor'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700 capitalize">
                    {food.category.replace('_', ' ')}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    {food.quantity.amount} {food.quantity.unit}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{food.location.city || food.location.address}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <DonationStatusBadge status={food.status} />
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{new Date(food.expiresAt).toLocaleDateString()}</span>
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
