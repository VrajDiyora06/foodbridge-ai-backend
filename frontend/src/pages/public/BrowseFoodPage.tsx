import React from 'react';

export const BrowseFoodPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Available Food</h1>
        <p className="text-slate-500 text-sm">Discover surplus food listings available for pickup near your location.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        Browse Food page placeholder. (Will be integrated with backend API)
      </div>
    </div>
  );
};
