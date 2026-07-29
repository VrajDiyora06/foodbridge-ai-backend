import React from 'react';
import { useParams } from 'react-router-dom';

export const FoodDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Food Item Details</h1>
        <p className="text-slate-500 text-sm">Listing ID: {id || 'N/A'}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        Food details view placeholder. (Will be integrated with backend API)
      </div>
    </div>
  );
};
