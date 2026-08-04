import React, { useState } from 'react';
import { ShoppingBag, X, Calendar, MapPin } from 'lucide-react';
import type { FoodItem } from '../../donor/types/donor.types';

interface ConfirmReservationDialogProps {
  isOpen: boolean;
  food: FoodItem | null;
  isSubmitting?: boolean;
  onConfirm: (notes?: string, pickupTime?: string) => Promise<void>;
  onCancel: () => void;
}

export const ConfirmReservationDialog: React.FC<ConfirmReservationDialogProps> = ({
  isOpen,
  food,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  const [notes, setNotes] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  if (!isOpen || !food) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes, pickupTime || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Food Reservation</h3>
            <p className="text-xs text-slate-500">Claim this surplus food listing</p>
          </div>
        </div>

        {/* Item Summary */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <p className="font-bold text-sm text-slate-900">{food.title}</p>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{food.location.city || food.location.address}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Expires: {new Date(food.expiresAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Estimated Pickup Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Note to Donor (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. NGO pickup vehicle will arrive at 3:00 PM..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-xs transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Claim'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
