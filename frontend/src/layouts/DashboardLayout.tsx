import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

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
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 min-w-0">
          <main className="flex-1">
            <PageContainer maxWidth="7xl">
              <Breadcrumb />
              <Outlet />
            </PageContainer>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
