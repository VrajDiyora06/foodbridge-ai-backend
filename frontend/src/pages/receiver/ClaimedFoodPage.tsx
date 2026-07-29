import React from 'react';

export const ClaimedFoodPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Claimed & Delivered Food</h1>
        <p className="text-slate-500 text-sm">History of successfully collected food donations.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-500 text-center">
        Claimed Food History Placeholder.
      </div>
    </div>
  );
};
