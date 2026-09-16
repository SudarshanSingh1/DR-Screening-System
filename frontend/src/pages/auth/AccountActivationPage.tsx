import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { activateAccount } from '../../services/authService';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

/**
 * AccountActivationPage
 *
 * Role-independent activation page for Patient, Screening Staff, and Doctor accounts.
 * The activation link from the email is: /activate?token=<raw_token>
 *
 * After successful activation:
 * - The backend returns the account's role.
 * - This page redirects to /patient, /staff, or /doctor based on the role.
 * - Never redirects based on email or any client-supplied identity.
 */

const ROLE_REDIRECT: Record<string, string> = {
  patient: '/patient',
  screening_staff: '/staff',
  doctor: '/doctor',
  engineer_admin: '/staff',
};

export const AccountActivationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activationDone, setActivationDone] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/login');

  // Validate token presence on mount
  useEffect(() => {
    if (!token || token.length !== 64) {
      setError('Invalid or missing activation link. Please check your email for the correct activation link.');
    }
  }, [token]);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || token.length !== 64) {
      setError('Invalid activation token. Please use the link from your email.');
      return;
    }

    if (!passwordValid) {
      setError('Password does not meet the security requirements below.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await activateAccount(token, password);
      if (res.success && res.data?.role) {
        const dest = ROLE_REDIRECT[res.data.role] ?? '/login';
        setRedirectPath(dest);
        setActivationDone(true);
        // Redirect after a brief success display
        setTimeout(() => navigate(dest, { replace: true }), 2000);
      } else {
        setError('Activation succeeded but the role could not be determined. Redirecting to login.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    } catch (err: any) {
      const code = err?.code;
      if (code === 'TOKEN_ALREADY_USED') {
        setError('This activation link has already been used. Please log in with your existing password.');
      } else if (code === 'TOKEN_EXPIRED') {
        setError('This activation link has expired. Contact your administrator to generate a new one.');
      } else if (code === 'INVALID_TOKEN') {
        setError('Invalid activation link. Please use the link from your activation email exactly as sent.');
      } else if (code === 'VALIDATION_ERROR') {
        setError('Password does not meet the requirements. Please check the requirements below.');
      } else {
        setError(err?.message ?? 'Activation failed. Please try again or contact support.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4 shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Activate Your Account</h1>
          <p className="text-gray-500 text-sm mt-2">Set a secure password to activate your Vision AI Platform account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Success state */}
          {activationDone ? (
            <div className="text-center space-y-4 py-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Account Activated</h2>
              <p className="text-gray-500 text-sm">
                Your account is now active. Redirecting to your dashboard…
              </p>
              <p className="text-xs text-blue-600 font-mono">{redirectPath}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Token missing */}
              {!token && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    No activation token found in the URL. Please use the link from your activation email exactly as sent.
                  </p>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={!token || submitting}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && <PasswordStrength password={password} />}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={!token || submitting}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${
                      confirmPassword && !passwordsMatch
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300'
                    }`}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Passwords match.
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!token || !passwordValid || !passwordsMatch || submitting}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Activating…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Activate Account
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Already activated?{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                  Log in
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
