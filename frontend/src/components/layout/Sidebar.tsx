import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  PackageCheck,
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  UtensilsCrossed,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  HeartHandshake,
  Building2,
} from 'lucide-react';
import type { UserRole } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  role: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'donor':
        return { label: 'Donor Portal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: HeartHandshake };
      case 'ngo':
      case 'receiver':
      case 'volunteer':
        return { label: 'Receiver Portal', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: Building2 };
      case 'admin':
        return { label: 'Admin Console', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Shield };
      default:
        return { label: 'Portal', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: User };
    }
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  const navItems = {
    donor: [
      { label: 'Dashboard', path: '/donor', icon: LayoutDashboard },
      { label: 'Donate Food', path: '/donor/donate', icon: PlusCircle },
      { label: 'My Donations', path: '/donor/donations', icon: PackageCheck },
      { label: 'Profile', path: '/donor/profile', icon: User },
    ],
    receiver: [
      { label: 'Dashboard', path: '/receiver', icon: LayoutDashboard },
      { label: 'Available Food', path: '/receiver/available', icon: ShoppingBag },
      { label: 'My Reservations', path: '/receiver/reservations', icon: Clock },
      { label: 'Claimed Food', path: '/receiver/claimed', icon: CheckCircle2 },
      { label: 'Profile', path: '/receiver/profile', icon: User },
    ],
    ngo: [
      { label: 'Dashboard', path: '/receiver', icon: LayoutDashboard },
      { label: 'Available Food', path: '/receiver/available', icon: ShoppingBag },
      { label: 'My Reservations', path: '/receiver/reservations', icon: Clock },
      { label: 'Claimed Food', path: '/receiver/claimed', icon: CheckCircle2 },
      { label: 'Profile', path: '/receiver/profile', icon: User },
    ],
    volunteer: [
      { label: 'Dashboard', path: '/receiver', icon: LayoutDashboard },
      { label: 'Available Food', path: '/receiver/available', icon: ShoppingBag },
      { label: 'My Reservations', path: '/receiver/reservations', icon: Clock },
      { label: 'Claimed Food', path: '/receiver/claimed', icon: CheckCircle2 },
      { label: 'Profile', path: '/receiver/profile', icon: User },
    ],
    user: [
      { label: 'Dashboard', path: '/receiver', icon: LayoutDashboard },
      { label: 'Available Food', path: '/receiver/available', icon: ShoppingBag },
      { label: 'My Reservations', path: '/receiver/reservations', icon: Clock },
      { label: 'Claimed Food', path: '/receiver/claimed', icon: CheckCircle2 },
      { label: 'Profile', path: '/receiver/profile', icon: User },
    ],
    admin: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Food Listings', path: '/admin/food', icon: UtensilsCrossed },
      { label: 'Reservations', path: '/admin/reservations', icon: FileCheck2 },
    ],
  };

  const currentNav = navItems[role] || navItems.donor;

  return (
    <aside
      className={`relative bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-6 z-10 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Role Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
          <RoleIcon className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleInfo.color}`}
            >
              {roleInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/donor' || item.path === '/receiver' || item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Info Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize truncate">{user?.role || role}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
