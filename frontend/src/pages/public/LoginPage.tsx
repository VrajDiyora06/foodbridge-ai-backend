import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from '../../components/modals/ForgotPasswordModal';
import type { LoginCredentials } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setErrorMessage(null);
    try {
      await login(data);
      // Determine default redirect path if not specified
      if (from) {
        navigate(from, { replace: true });
      } else {
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
          const user = JSON.parse(savedUserStr);
          if (user.role === 'donor') {
            navigate('/donor', { replace: true });
          } else if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/receiver', { replace: true });
          }
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        apiError.response?.data?.message || apiError.message || 'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center">
          <img src="/logo.png" alt="FoodBridge AI Logo" className="h-16 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1.5">Sign in to manage food donations and reservations</p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                errors.email
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs text-emerald-600 font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all outline-none ${
                  errors.password
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <p className="text-center text-sm text-slate-600 pt-2">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};
