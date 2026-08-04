import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/auth.service';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setStatusMessage('No verification token provided in URL.');
      setIsSuccess(false);
      return;
    }

    const performVerification = async () => {
      try {
        const msg = await authService.verifyEmail(token);
        setStatusMessage(msg || 'Email verified successfully!');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: unknown) {
        const apiError = err as { response?: { data?: { message?: string } }; message?: string };
        setStatusMessage(
          apiError.response?.data?.message || apiError.message || 'Verification failed or link expired.'
        );
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token, navigate]);

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
        {loading ? (
          <div className="py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-slate-800">Verifying your email...</h2>
            <p className="text-sm text-slate-500">Please wait a moment while we validate your token.</p>
          </div>
        ) : isSuccess ? (
          <div className="py-6 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
            <p className="text-sm text-slate-600">{statusMessage}</p>
            <p className="text-xs text-slate-400">Redirecting to login page in 3 seconds...</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-block py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                Go to Sign In Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-2">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-sm text-rose-600 font-medium">{statusMessage}</p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                to="/login"
                className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
              >
                Back to Login
              </Link>
              <Link
                to="/register"
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
              >
                Register Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
