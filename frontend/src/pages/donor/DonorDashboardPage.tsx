import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, ArrowRight, HeartHandshake } from 'lucide-react';
import { useDonations, useStatistics } from '../../features/donor/hooks/useDonorQueries';
import { StatisticsCards } from '../../features/donor/components/StatisticsCards';
import { DonationCard } from '../../features/donor/components/DonationCard';
import { DeleteDialog } from '../../features/donor/components/DeleteDialog';
import { useDeleteDonation } from '../../features/donor/hooks/useDonorQueries';

export const DonorDashboardPage: React.FC = () => {
  const { data: stats, isLoading: isStatsLoading } = useStatistics();
  const { data: donationsData, isLoading: isDonationsLoading } = useDonations({
    limit: 6,
    page: 1,
  });

  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const deleteMutation = useDeleteDonation();

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100 uppercase tracking-wider">
            Donor Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Share surplus food, nourish communities.
          </h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Manage your food donations, accept claim requests, and track real-time impact metrics across your region.
          </p>
        </div>

        <Link
          to="/donor/donate"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-emerald-700 font-bold rounded-2xl shadow-lg hover:bg-emerald-50 transition-all text-sm shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Donation
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <StatisticsCards stats={stats} isLoading={isStatsLoading} />

      {/* Recent Donations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Recent Donations
            </h2>
            <p className="text-xs text-slate-500">Your latest food listings and active claims</p>
          </div>

          <Link
            to="/donor/donations"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isDonationsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse" />
            ))}
          </div>
        ) : !donationsData?.data || donationsData.data.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No active food donations yet</h3>
              <p className="text-xs text-slate-500 mt-1">Start by creating your first food donation listing!</p>
            </div>
            <Link
              to="/donor/donate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Create Donation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donationsData.data.map((food) => (
              <DonationCard key={food._id} food={food} onDelete={(id) => setDeleteId(id)} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteDialog
        isOpen={Boolean(deleteId)}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
