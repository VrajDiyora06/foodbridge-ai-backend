import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Compass, HeartHandshake } from 'lucide-react';
import {
  useAvailableFood,
  useReservations,
  useReservationStatistics,
  useCreateReservation,
} from '../../features/receiver/hooks/useReceiverQueries';
import { ReceiverStatisticsCards } from '../../features/receiver/components/ReceiverStatisticsCards';
import { FoodCard } from '../../features/receiver/components/FoodCard';
import { ReservationCard } from '../../features/receiver/components/ReservationCard';
import { ConfirmReservationDialog } from '../../features/receiver/components/ConfirmReservationDialog';
import type { FoodItem } from '../../features/donor/types/donor.types';

export const ReceiverDashboardPage: React.FC = () => {
  const { data: stats, isLoading: isStatsLoading } = useReservationStatistics();
  const { data: availableFoodData, isLoading: isFoodLoading } = useAvailableFood({ limit: 3 });
  const { data: reservationsData, isLoading: isReservationsLoading } = useReservations({ limit: 3 });

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const createReservationMutation = useCreateReservation();

  const handleConfirmReservation = async (notes?: string, pickupTime?: string) => {
    if (selectedFood) {
      await createReservationMutation.mutateAsync({
        foodId: selectedFood._id,
        notes,
        pickupTime,
      });
      setSelectedFood(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-100 uppercase tracking-wider">
            Receiver & NGO Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Claim fresh food, serve those in need.
          </h1>
          <p className="text-sm text-teal-100/90 leading-relaxed">
            Browse available surplus food donations in your city, submit claims, and manage pickup schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/receiver/available"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-teal-800 font-bold rounded-2xl shadow-lg hover:bg-teal-50 transition-all text-xs shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Catalog
          </Link>

          <Link
            to="/receiver/nearby"
            className="inline-flex items-center gap-2 px-5 py-3 bg-teal-800/80 hover:bg-teal-900 text-white font-bold rounded-2xl border border-teal-500/30 transition-all text-xs shrink-0"
          >
            <Compass className="w-4 h-4" />
            Nearby Map
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <ReceiverStatisticsCards stats={stats} isLoading={isStatsLoading} />

      {/* Available Food Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              Fresh Food Available Now
            </h2>
            <p className="text-xs text-slate-500">Listings ready for claim and pickup</p>
          </div>

          <Link
            to="/receiver/available"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Browse All Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isFoodLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse" />
            ))}
          </div>
        ) : !availableFoodData?.data || availableFoodData.data.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No active food listings available right now. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableFoodData.data.map((food) => (
              <FoodCard key={food._id} food={food} onReserve={(item) => setSelectedFood(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Reservations Feed */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              My Recent Claims
            </h2>
            <p className="text-xs text-slate-500">Your latest food reservation activity</p>
          </div>

          <Link
            to="/receiver/reservations"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View My Reservations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isReservationsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse" />
            ))}
          </div>
        ) : !reservationsData?.data || reservationsData.data.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            You have not made any food claims yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reservationsData.data.map((res) => (
              <ReservationCard key={res._id} reservation={res} />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Reservation Modal */}
      <ConfirmReservationDialog
        isOpen={Boolean(selectedFood)}
        food={selectedFood}
        isSubmitting={createReservationMutation.isPending}
        onConfirm={handleConfirmReservation}
        onCancel={() => setSelectedFood(null)}
      />
    </div>
  );
};
