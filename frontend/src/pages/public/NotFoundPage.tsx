import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto">
      <div className="text-6xl font-extrabold text-emerald-600">404</div>
      <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="text-slate-500 text-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700 transition-colors"
      >
        <Home className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  );
};
