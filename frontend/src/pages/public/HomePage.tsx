import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, HeartHandshake, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Utensils className="w-3.5 h-3.5" /> AI-Powered Food Redistribution Network
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Bridging Surplus Food to Communities in Real-Time
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl leading-relaxed">
            Connecting restaurants, supermarkets, and event hosts with verified NGOs and volunteers to eliminate food waste and ensure no meal goes unshared.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/browse"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
            >
              Browse Available Food <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/donor/donate"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 backdrop-blur-xs transition-all"
            >
              Donate Surplus Food
            </Link>
          </div>
        </div>
      </section>

      {/* Role Cards Quick Navigation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Food Donors</h3>
          <p className="text-slate-600 text-sm mb-4">
            Easily list surplus food donations, specify expiration details, and track real-time claim status.
          </p>
          <Link
            to="/donor"
            className="text-emerald-700 font-semibold text-sm hover:underline inline-flex items-center gap-1"
          >
            Access Donor Portal &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">NGOs & Receivers</h3>
          <p className="text-slate-600 text-sm mb-4">
            Discover nearby food listings, reserve meals for distribution, and manage pickups efficiently.
          </p>
          <Link
            to="/receiver"
            className="text-teal-700 font-semibold text-sm hover:underline inline-flex items-center gap-1"
          >
            Access Receiver Portal &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Admin Console</h3>
          <p className="text-slate-600 text-sm mb-4">
            Monitor platform metrics, manage user verification, oversee food listings, and review audit logs.
          </p>
          <Link
            to="/admin"
            className="text-purple-700 font-semibold text-sm hover:underline inline-flex items-center gap-1"
          >
            Access Admin Console &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
};
