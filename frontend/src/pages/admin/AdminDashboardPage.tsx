import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Megaphone, Users, Utensils, BarChart3 } from 'lucide-react';
import {
  useAdminDashboard,
  useAdminAnalytics,
} from '../../features/admin/hooks/useAdminQueries';
import { DashboardCards } from '../../features/admin/components/DashboardCards';
import { AnalyticsCharts } from '../../features/admin/components/AnalyticsCharts';

export const AdminDashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading: isDashboardLoading } = useAdminDashboard();
  const { data: analyticsData } = useAdminAnalytics();

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
            Admin Governance Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Operations & Analytics
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Monitor system users, food donation moderation queues, reservation claims, and platform trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/broadcast"
            className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl shadow-lg transition-all text-xs shrink-0"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast Notice
          </Link>

          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all text-xs shrink-0"
          >
            <BarChart3 className="w-4 h-4" />
            Full Analytics
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <DashboardCards data={dashboardData} isLoading={isDashboardLoading} />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                User Management
              </h3>
              <p className="text-xs text-slate-500">Roles, status & accounts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/food"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Food Moderation
              </h3>
              <p className="text-xs text-slate-500">Approve & verify listings</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/reservations"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Reservation Claims
              </h3>
              <p className="text-xs text-slate-500">System claim monitoring</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Analytics Charts Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-bold text-slate-900">Platform Analytics Visualizations</h2>
        <AnalyticsCharts data={analyticsData} />
      </div>
    </div>
  );
};
