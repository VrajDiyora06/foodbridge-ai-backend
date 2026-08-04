import React from 'react';
import { ShoppingBag, Clock, CheckCircle2, XCircle, Award } from 'lucide-react';
import type { ReceiverStats } from '../types/receiver.types';

interface ReceiverStatisticsCardsProps {
  stats?: ReceiverStats;
  isLoading?: boolean;
}

export const ReceiverStatisticsCards: React.FC<ReceiverStatisticsCardsProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Total Claims',
      value: stats?.totalReservations || 0,
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Pending Approval',
      value: stats?.pendingCount || 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Claim Approved',
      value: stats?.acceptedCount || 0,
      icon: CheckCircle2,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      title: 'Completed',
      value: stats?.completedCount || 0,
      icon: Award,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Cancelled / Rejected',
      value: (stats?.cancelledCount || 0) + (stats?.rejectedCount || 0),
      icon: XCircle,
      color: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{item.title}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
