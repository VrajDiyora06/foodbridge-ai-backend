import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDonation } from '../../features/donor/hooks/useDonorQueries';
import { DonationForm } from '../../features/donor/components/DonationForm';
import type { CreateFoodInput } from '../../features/donor/types/donor.types';

export const DonateFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateDonation();

  const handleSubmit = async (data: CreateFoodInput) => {
    await createMutation.mutateAsync(data);
    navigate('/donor/donations');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create Food Donation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish surplus food items for NGOs, volunteers, and receivers in your area.
        </p>
      </div>

      <DonationForm isSubmitting={createMutation.isPending} onSubmit={handleSubmit} />
    </div>
  );
};
