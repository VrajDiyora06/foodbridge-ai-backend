import React from 'react';

export const DonateFoodPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">List Surplus Food Donation</h1>
        <p className="text-slate-500 text-sm">Fill in details about the surplus food listing to publish to nearby NGOs.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-500 text-center">
        Donate Food Form Placeholder. (Will be integrated with React Hook Form & Food API)
      </div>
    </div>
  );
};
