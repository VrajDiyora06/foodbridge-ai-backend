import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  HeartHandshake,
  ShieldCheck,
  Building2,
  LogIn,
  UserPlus,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const publicNavLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse Food', path: '/browse' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img src="/logo.png" alt="FoodBridge AI Logo" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200" />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                FoodBridge
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  AI
                </span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase hidden sm:block">
                Food Redistribution Network
              </span>
            </div>
          </Link>

          {/* Search Bar (UI only) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search food donations, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {publicNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Portal Switcher & Auth Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Portal Switcher Pills */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
              <Link
                to="/donor"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  location.pathname.startsWith('/donor')
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Donor Portal"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Donor
              </Link>
              <Link
                to="/receiver"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  location.pathname.startsWith('/receiver')
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Receiver Portal"
              >
                <Building2 className="w-3.5 h-3.5" />
                Receiver
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Admin Console"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </Link>
            </div>

            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden lg:block" />

            {/* Auth Buttons or User Menu */}
            {isAuthenticated && user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-emerald-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-600/20 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search food donations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
            />
          </div>

          <nav className="flex flex-col space-y-1">
            {publicNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3">
              Portals
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/donor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-medium border border-slate-200"
              >
                <HeartHandshake className="w-4 h-4 mb-1 text-emerald-600" />
                Donor
              </Link>
              <Link
                to="/receiver"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-medium border border-slate-200"
              >
                <Building2 className="w-4 h-4 mb-1 text-emerald-600" />
                Receiver
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-medium border border-slate-200"
              >
                <ShieldCheck className="w-4 h-4 mb-1 text-emerald-600" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
