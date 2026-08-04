import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, HeartHandshake, Building2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { RegisterData, UserRole } from '../../types/auth';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    defaultValues: {
      role: 'donor',
    },
  });

  const passwordValue = watch('password');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await registerAuth({ ...data, role: selectedRole });
      setSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        apiError.response?.data?.message || apiError.message || 'Registration failed. Please check details.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center">
          <img src="/logo.png" alt="FoodBridge AI Logo" className="h-16 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an Account</h1>
          <p className="text-sm text-slate-500 mt-1.5">Join FoodBridge AI to reduce food waste and feed communities</p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('donor')}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'donor'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 font-semibold ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <HeartHandshake className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs">Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ngo')}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'ngo'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 font-semibold ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs">NGO / Org</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('volunteer')}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'volunteer'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 font-semibold ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Users className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs">Volunteer</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Vraj Diyora"
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                errors.name
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
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
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === passwordValue || 'Passwords do not match',
              })}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                errors.confirmPassword
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <p className="text-center text-sm text-slate-600 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
