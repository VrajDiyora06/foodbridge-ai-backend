import React from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AdminAnalyticsData } from '../types/admin.types';
import { ChartCard } from './ChartCard';

interface AnalyticsChartsProps {
  data?: AdminAnalyticsData;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const dailyData = data?.dailyDonations || [
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 19 },
    { date: 'Wed', count: 15 },
    { date: 'Thu', count: 24 },
    { date: 'Fri', count: 32 },
    { date: 'Sat', count: 28 },
    { date: 'Sun', count: 20 },
  ];

  const categoryData = data?.categoryDistribution || [
    { category: 'Cooked Meals', count: 45 },
    { category: 'Fresh Produce', count: 30 },
    { category: 'Bakery', count: 15 },
    { category: 'Packaged Food', count: 10 },
  ];

  const userGrowth = data?.userGrowth || [
    { date: 'Week 1', users: 120 },
    { date: 'Week 2', users: 180 },
    { date: 'Week 3', users: 260 },
    { date: 'Week 4', users: 340 },
  ];

  const COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Daily Donations Bar Chart */}
      <ChartCard title="Daily Food Donations" subtitle="Total listings posted per day">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData}>
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* User Growth Area Chart */}
      <ChartCard title="Platform User Growth" subtitle="Cumulative registered users">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={userGrowth}>
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Area type="monotone" dataKey="users" stroke="#6366f1" fill="#e0e7ff" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Category Distribution Pie Chart */}
      <ChartCard title="Category Distribution" subtitle="Food types contributed">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
            >
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
