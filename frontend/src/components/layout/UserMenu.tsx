import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ShieldCheck, HeartHandshake, Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from './Avatar';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const getRolePortalPath = (): string => {
    if (user.role === 'donor') return '/donor';
    if (user.role === 'admin') return '/admin';
    return '/receiver';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="User Account Menu"
      >
        <Avatar name={user.name} src={user.avatar} size="md" showOnlineStatus />
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 leading-none mb-0.5">{user.name}</span>
          <span className="text-[10px] font-medium text-slate-500 capitalize">{user.role}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider border border-emerald-200">
              Role: {user.role}
            </div>
          </div>

          {/* Nav Items */}
          <div className="py-1">
            <Link
              to={getRolePortalPath()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
            >
              {user.role === 'admin' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : user.role === 'donor' ? (
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
              ) : (
                <Building2 className="w-4 h-4 text-emerald-600" />
              )}
              Dashboard Portal
            </Link>

            <Link
              to="/donor/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              Profile Settings
            </Link>
          </div>

          {/* Logout Footer */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
