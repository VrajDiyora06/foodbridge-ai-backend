import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ShoppingBag,
  Leaf,
} from 'lucide-react';
import {
  useFoodDetail,
  useCreateReservation,
} from '../../features/receiver/hooks/useReceiverQueries';
import { DonationStatusBadge } from '../../features/donor/components/DonationStatusBadge';
import { ConfirmReservationDialog } from '../../features/receiver/components/ConfirmReservationDialog';

export const FoodDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data: food, isLoading } = useFoodDetail(id || '');
  const createReservationMutation = useCreateReservation();

  const handleConfirmReservation = async (notes?: string, pickupTime?: string) => {
    if (food) {
      await createReservationMutation.mutateAsync({
        foodId: food._id,
        notes,
        pickupTime,
      });
      setIsConfirmOpen(false);
      navigate('/receiver/reservations');
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading food details...</p>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900">Food listing not found.</p>
        <button
          type="button"
          onClick={() => navigate('/receiver/available')}
          className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const formattedExpiry = new Date(food.expiresAt).toLocaleString();
  const formattedPickupStart = new Date(food.pickupWindow.startTime).toLocaleString();
  const formattedPickupEnd = new Date(food.pickupWindow.endTime).toLocaleString();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <button
        type="button"
        onClick={() => navigate('/receiver/available')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Food Catalog
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {food.imageUrl && (
          <div className="h-64 w-full bg-slate-100 overflow-hidden">
            <img src={food.imageUrl} alt={food.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DonationStatusBadge status={food.status} />
                <span className="text-xs font-semibold text-slate-500 capitalize bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {food.category.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{food.title}</h1>
            </div>

            {food.status === 'available' && (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 text-sm transition-all shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                Claim This Food
              </button>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description & Preparation
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{food.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Schedule & Expiry
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <span className="font-semibold text-slate-700">Expires:</span> {formattedExpiry}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Pickup Start:</span>{' '}
                  {formattedPickupStart}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Pickup End:</span> {formattedPickupEnd}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Pickup Location
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">{food.location.address}</p>
                <p>
                  {food.location.city} {food.location.state} {food.location.zipCode}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Dietary Attributes
            </h3>

            <div className="flex flex-wrap gap-2">
              {food.isVegetarian && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200">
                  🌱 Vegetarian
                </span>
              )}
              {food.isVegan && (
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-xl text-xs font-semibold border border-teal-200">
                  🌿 Vegan
                </span>
              )}
              {food.isHalal && (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold border border-purple-200">
                  ✨ Halal Certified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmReservationDialog
        isOpen={isConfirmOpen}
        food={food}
        isSubmitting={createReservationMutation.isPending}
        onConfirm={handleConfirmReservation}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
