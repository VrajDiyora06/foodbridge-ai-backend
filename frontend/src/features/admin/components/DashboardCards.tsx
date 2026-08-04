import React from 'react';
import { Users, HeartHandshake, Building2, UserCheck, Utensils, ShoppingBag } from 'lucide-react';
import type { AdminDashboardData } from '../types/admin.types';
import { MetricCard } from './MetricCard';

interface DashboardCardsProps {
  data?: AdminDashboardData;
  isLoading?: boolean;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-white rounded-3xl border border-slate-200 p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Total Users',
      value: data?.users.total || 0,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Donors',
      value: data?.users.donors || 0,
      icon: HeartHandshake,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'NGO Partners',
      value: data?.users.ngos || 0,
      icon: Building2,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      title: 'Volunteers',
      value: data?.users.volunteers || 0,
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Active Food',
      value: data?.food.available || 0,
      icon: Utensils,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Reservations',
      value: data?.reservations.total || 0,
      icon: ShoppingBag,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {items.map((item) => (
        <MetricCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </div>
  );
};
