import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Determine user role (prefer authenticated user role, fallback to route-based role)
  const getRole = (): UserRole => {
    if (user?.role) return user.role;
    if (location.pathname.startsWith('/donor')) return 'donor';
    if (location.pathname.startsWith('/receiver')) return 'receiver';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'donor';
  };

  const role = getRole();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar role={role} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
