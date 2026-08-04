import React from 'react';
import { useStatistics } from '../../features/donor/hooks/useDonorQueries';
import { StatisticsCards } from '../../features/donor/components/StatisticsCards';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, PieChart, Heart, Users } from 'lucide-react';

export const DonationStatsPage: React.FC = () => {
  const { data: stats, isLoading } = useStatistics();

  const categoryData = stats?.categoryBreakdown || [
    { category: 'Cooked Meals', count: stats?.totalDonations ? Math.ceil(stats.totalDonations * 0.4) : 12 },
    { category: 'Fresh Produce', count: stats?.totalDonations ? Math.ceil(stats.totalDonations * 0.3) : 8 },
    { category: 'Bakery', count: stats?.totalDonations ? Math.ceil(stats.totalDonations * 0.2) : 5 },
    { category: 'Packaged Food', count: stats?.totalDonations ? Math.ceil(stats.totalDonations * 0.1) : 3 },
  ];

  const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Donation Impact Statistics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics, category distribution, and estimated social impact of your food donations.
        </p>
      </div>

      {/* KPI Cards */}
      <StatisticsCards stats={stats} isLoading={isLoading} />

      {/* Charts & Impact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              Donations by Food Category
            </h2>
            <span className="text-xs text-slate-400 font-medium">Real-time breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estimated Impact Card */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100">
              <Award className="w-4 h-4 text-amber-300" />
              Community Impact Leader
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight">Your Contribution Matters</h3>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Every food listing prevents organic waste in landfills while providing fresh, nutritious meals to families in need.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-600/40">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <Users className="w-4 h-4 text-emerald-300" />
                People Fed
              </div>
              <p className="text-2xl font-black text-white mt-1">
                {stats?.peopleFedEstimate || (stats?.totalDonations || 0) * 8}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <Heart className="w-4 h-4 text-rose-300" />
                Kg Saved
              </div>
              <p className="text-2xl font-black text-white mt-1">
                {stats?.totalQuantityKg || (stats?.totalDonations || 0) * 12} kg
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
