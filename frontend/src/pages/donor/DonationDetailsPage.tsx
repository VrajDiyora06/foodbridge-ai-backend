import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  ArrowLeft,
  Leaf,
} from 'lucide-react';
import { useDonation, useDeleteDonation } from '../../features/donor/hooks/useDonorQueries';
import { DonationStatusBadge } from '../../features/donor/components/DonationStatusBadge';
import { DeleteDialog } from '../../features/donor/components/DeleteDialog';

export const DonationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const { data: food, isLoading } = useDonation(id || '');
  const deleteMutation = useDeleteDonation();

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(id);
      setIsDeleteOpen(false);
      navigate('/donor/donations');
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading donation details...</p>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900">Food donation not found.</p>
        <button
          type="button"
          onClick={() => navigate('/donor/donations')}
          className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
        >
          Back to My Donations
        </button>
      </div>
    );
  }

  const formattedExpiry = new Date(food.expiresAt).toLocaleString();
  const formattedPickupStart = new Date(food.pickupWindow.startTime).toLocaleString();
  const formattedPickupEnd = new Date(food.pickupWindow.endTime).toLocaleString();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/donor/donations')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Donations
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/donor/donations/${food._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors border border-slate-200"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-xs transition-colors border border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {food.imageUrl && (
          <div className="h-64 w-full bg-slate-100 overflow-hidden">
            <img src={food.imageUrl} alt={food.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header & Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DonationStatusBadge status={food.status} />
                <span className="text-xs font-semibold text-slate-500 capitalize bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {food.category.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{food.title}</h1>
            </div>

            <div className="text-left sm:text-right bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 shrink-0">
              <span className="text-[10px] font-semibold uppercase text-emerald-700 tracking-wider block">
                Quantity Available
              </span>
              <span className="text-xl font-black text-emerald-900">
                {food.quantity.amount} {food.quantity.unit}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description & Preparation
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{food.description}</p>
          </div>

          {/* Schedule & Pickup Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Schedule & Expiry
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <span className="font-semibold text-slate-700">Expires:</span> {formattedExpiry}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Pickup Window Start:</span>{' '}
                  {formattedPickupStart}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Pickup Window End:</span> {formattedPickupEnd}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Pickup Location
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">{food.location.address}</p>
                <p>
                  {food.location.city} {food.location.state} {food.location.zipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Dietary Attributes */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Dietary & Safety Attributes
            </h3>

            <div className="flex flex-wrap gap-2">
              {food.isVegetarian && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200">
                  🌱 Vegetarian
                </span>
              )}
              {food.isVegan && (
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-xl text-xs font-semibold border border-teal-200">
                  🌿 Vegan
                </span>
              )}
              {food.isHalal && (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold border border-purple-200">
                  ✨ Halal Certified
                </span>
              )}
              {!food.isVegetarian && !food.isVegan && !food.isHalal && (
                <span className="text-xs text-slate-500 italic">Standard prepared food item</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};
