import React from 'react';

export const MyReservationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Food Reservations</h1>
        <p className="text-slate-500 text-sm">Track your pending, accepted, and active pickup requests.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-500 text-center">
        My Reservations List Placeholder.
      </div>
    </div>
  );
};
