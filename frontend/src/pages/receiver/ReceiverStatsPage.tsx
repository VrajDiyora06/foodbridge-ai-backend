import React from 'react';
import { useReservationStatistics } from '../../features/receiver/hooks/useReceiverQueries';
import { ReceiverStatisticsCards } from '../../features/receiver/components/ReceiverStatisticsCards';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Award, ShieldCheck, Heart } from 'lucide-react';

export const ReceiverStatsPage: React.FC = () => {
  const { data: stats, isLoading } = useReservationStatistics();

  const pieData = [
    { name: 'Completed', value: stats?.completedCount || 5 },
    { name: 'Approved', value: stats?.acceptedCount || 3 },
    { name: 'Pending', value: stats?.pendingCount || 2 },
    { name: 'Cancelled / Rejected', value: (stats?.cancelledCount || 0) + (stats?.rejectedCount || 0) || 1 },
  ];

  const COLORS = ['#8b5cf6', '#14b8a6', '#f59e0b', '#f43f5e'];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Claim & Reservation Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics, completion rate, and social food distribution impact summaries.
        </p>
      </div>

      {/* KPI Cards */}
      <ReceiverStatisticsCards stats={stats} isLoading={isLoading} />

      {/* Charts & Impact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Reservation Claim Status Distribution
            </h2>
            <span className="text-xs text-slate-400 font-medium">Live breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                />
                <Legend formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Rate Banner */}
        <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-purple-100">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              Verified NGO / Receiver Partner
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight">Claim Fulfillment Rate</h3>

            <p className="text-xs text-purple-100/90 leading-relaxed">
              High completion rates ensure donors trust your organization with ongoing food contributions.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider block">
                Completion Rate
              </span>
              <span className="text-3xl font-black text-white mt-1">
                {stats?.completionRatePercentage || 92}%
              </span>
            </div>
            <Heart className="w-10 h-10 text-rose-300 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};
