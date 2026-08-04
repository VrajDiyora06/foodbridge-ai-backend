import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Globe, Share2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="FoodBridge AI Logo" className="h-9 w-auto object-contain" />
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1">
                FoodBridge
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  AI
                </span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-powered food redistribution network connecting food donors, NGOs, and volunteers to eliminate surplus food waste and feed communities in real-time.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#website"
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#share"
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#link"
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="External Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-emerald-400 transition-colors">
                  Browse Surplus Food
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Roles */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              User Portals
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/donor" className="hover:text-emerald-400 transition-colors">
                  Food Donor Portal
                </Link>
              </li>
              <li>
                <Link to="/receiver" className="hover:text-emerald-400 transition-colors">
                  NGO & Receiver Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin Management Console
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Join Network as Partner
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Get in Touch
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@foodbridge.ai</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+1 (800) 555-FOOD</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>San Francisco, CA & Global Hubs</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} FoodBridge AI. Made with{' '}
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for zero food waste.
          </p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-slate-200 transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
