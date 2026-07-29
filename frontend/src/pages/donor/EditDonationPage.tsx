import React from 'react';
import { useParams } from 'react-router-dom';

export const EditDonationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Food Listing</h1>
        <p className="text-slate-500 text-sm">Update listing details for ID: {id || 'N/A'}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-500 text-center">
        Edit Donation Form Placeholder.
      </div>
    </div>
  );
};
