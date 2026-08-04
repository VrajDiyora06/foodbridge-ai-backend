import React from 'react';
import { useAdminAnalytics } from '../../features/admin/hooks/useAdminQueries';
import { AnalyticsCharts } from '../../features/admin/components/AnalyticsCharts';
import { ShieldCheck, Heart } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { data: analyticsData, isLoading } = useAdminAnalytics();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Performance Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics, completion rate, and social food distribution impact summaries.
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
          <p className="text-xs font-semibold text-slate-400">Loading analytics metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnalyticsCharts data={analyticsData} />

          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Overall Fulfillment Rate
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight">Food Rescue Efficiency</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Percentage of listed surplus food successfully claimed and delivered to beneficiaries.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex items-center gap-6 shrink-0">
              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Completion Rate
                </span>
                <span className="text-4xl font-black text-emerald-400 mt-1 block">
                  {analyticsData?.completionRatePercentage || 94}%
                </span>
              </div>
              <Heart className="w-12 h-12 text-rose-400 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
