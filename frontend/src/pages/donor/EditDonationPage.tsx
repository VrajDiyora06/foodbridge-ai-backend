import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDonation, useUpdateDonation } from '../../features/donor/hooks/useDonorQueries';
import { DonationForm } from '../../features/donor/components/DonationForm';
import type { CreateFoodInput } from '../../features/donor/types/donor.types';

export const EditDonationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: food, isLoading } = useDonation(id || '');
  const updateMutation = useUpdateDonation();

  const handleSubmit = async (data: CreateFoodInput) => {
    if (id) {
      await updateMutation.mutateAsync({ id, data });
      navigate('/donor/donations');
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading donation details...</p>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900">Food listing not found.</p>
        <button
          type="button"
          onClick={() => navigate('/donor/donations')}
          className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
        >
          Back to My Donations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Edit Food Donation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update food quantity, expiry time, or pickup details for this listing.
        </p>
      </div>

      <DonationForm
        initialData={food}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
