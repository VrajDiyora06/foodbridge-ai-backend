import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    // Standardize role mapping for receivers (ngo/volunteer/receiver/user)
    const hasPermission = allowedRoles.some((role) => {
      if (role === user.role) return true;
      if (role === 'receiver' && (user.role === 'ngo' || user.role === 'volunteer' || user.role === 'user')) {
        return true;
      }
      return false;
    });

    if (!hasPermission) {
      // Redirect to appropriate user home based on their actual role
      if (user.role === 'donor') {
        return <Navigate to="/donor" replace />;
      }
      if (user.role === 'ngo' || user.role === 'volunteer' || user.role === 'receiver') {
        return <Navigate to="/receiver" replace />;
      }
      if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
