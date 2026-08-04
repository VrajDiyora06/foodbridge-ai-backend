import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, XCircle, Building2 } from 'lucide-react';
import {
  useReservation,
  useCancelReservation,
} from '../../features/receiver/hooks/useReceiverQueries';
import { ReservationStatusBadge } from '../../features/receiver/components/ReservationStatusBadge';
import { ReservationTimeline } from '../../features/receiver/components/ReservationTimeline';

export const ReservationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: reservation, isLoading } = useReservation(id || '');
  const cancelMutation = useCancelReservation();

  const handleCancel = async () => {
    if (id && window.confirm('Are you sure you want to cancel this reservation claim?')) {
      await cancelMutation.mutateAsync({ id });
      navigate('/receiver/reservations');
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading reservation details...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900">Reservation claim not found.</p>
        <button
          type="button"
          onClick={() => navigate('/receiver/reservations')}
          className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
        >
          Back to My Reservations
        </button>
      </div>
    );
  }

  const food = typeof reservation.food === 'object' ? reservation.food : null;
  const donor = food && typeof food.donor === 'object' ? food.donor : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/receiver/reservations')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Reservations
        </button>

        {(reservation.status === 'pending' || reservation.status === 'accepted') && (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-xs transition-colors border border-rose-200"
          >
            <XCircle className="w-4 h-4" />
            Cancel Claim
          </button>
        )}
      </div>

      {/* Main Reservation Info */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ReservationStatusBadge status={reservation.status} />
              <span className="text-[10px] text-slate-400 font-mono">
                ID: #{reservation._id.slice(-8)}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {food ? food.title : 'Food Listing Claim'}
            </h1>
          </div>

          <div className="text-xs text-slate-500">
            Claimed on: {new Date(reservation.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Timeline Component */}
        <ReservationTimeline
          status={reservation.status}
          createdAt={reservation.createdAt}
          updatedAt={reservation.updatedAt}
        />

        {/* Linked Food & Donor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Donor Information
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">
                {donor ? donor.organizationName || donor.name : 'Verified Food Donor'}
              </p>
              {donor?.email && <p>Email: {donor.email}</p>}
              {donor?.phone && <p>Phone: {donor.phone}</p>}
            </div>
          </div>

          {food && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Pickup Location & Amount
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-emerald-700">
                  Amount: {food.quantity.amount} {food.quantity.unit}
                </p>
                <p>{food.location.address}, {food.location.city}</p>
              </div>
            </div>
          )}
        </div>

        {reservation.notes && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
              Notes Provided With Claim
            </p>
            <p className="text-xs text-amber-800">{reservation.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
