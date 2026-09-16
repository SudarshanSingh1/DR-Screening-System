import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import type { AuthPanelContent } from '../../components/auth/AuthLayout';
import { PasswordStrength, isPasswordStrong } from '../../components/auth/PasswordStrength';
import { resetPassword } from '../../services/authService';

const RESET_PANEL: AuthPanelContent = {
  eyebrow: 'SECURE RESET',
  heading: 'Create a Strong New Password',
  bullets: [
    'Minimum 8 characters required',
    'Include uppercase and lowercase letters',
    'Add at least one number and special character',
    'Never reuse a previously compromised password',
  ],
};

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceError, setServiceError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!newPassword) {
      newErrors['newPassword'] = 'New password is required.';
    } else if (!isPasswordStrong(newPassword)) {
      newErrors['newPassword'] = 'Password does not meet all requirements.';
    }
    if (!confirmPassword) {
      newErrors['confirmPassword'] = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      newErrors['confirmPassword'] = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServiceError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setServiceError(err.message || 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout panel={RESET_PANEL}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-green-600 mb-2">
            Password Updated Successfully
          </p>
          <h1 className="text-xl font-extrabold text-[#1e3a8a] mb-4">
            Your password has been reset
          </h1>
          <p className="text-sm text-[#475569] mb-8">
            You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            className="inline-block w-full bg-[#2663eb] hover:bg-[#1d4ed8] text-white rounded-lg py-3 font-bold tracking-widest uppercase text-sm transition-colors text-center"
          >
            Continue to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout panel={RESET_PANEL}>
      {/* Eyebrow */}
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-2">
        Reset Password
      </p>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-2">
        Create a New Password
      </h1>

      <p className="text-sm text-[#475569] leading-relaxed mb-6">
        Choose a strong password for your Vision AI account.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serviceError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
          >
            {serviceError}
          </div>
        )}

        {/* New password */}
        <div>
          <label
            htmlFor="rp-new"
            className="block text-xs font-bold text-[#1e3a8a] mb-1 uppercase tracking-wide"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="rp-new"
              type={showNew ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors['newPassword']) setErrors((p) => ({ ...p, newPassword: '' }));
              }}
              aria-describedby={errors['newPassword'] ? 'rp-new-error' : undefined}
              aria-invalid={!!errors['newPassword']}
              autoComplete="new-password"
              className="border border-gray-200 rounded-xl px-4 py-3 pr-11 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none w-full text-sm text-[#1e3a8a]"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#2663eb] transition-colors"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors['newPassword'] && (
            <p id="rp-new-error" role="alert" className="text-red-600 text-xs mt-1">
              {errors['newPassword']}
            </p>
          )}
          {newPassword && <PasswordStrength password={newPassword} />}
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="rp-confirm"
            className="block text-xs font-bold text-[#1e3a8a] mb-1 uppercase tracking-wide"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="rp-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors['confirmPassword'])
                  setErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              aria-describedby={errors['confirmPassword'] ? 'rp-confirm-error' : undefined}
              aria-invalid={!!errors['confirmPassword']}
              autoComplete="new-password"
              className="border border-gray-200 rounded-xl px-4 py-3 pr-11 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none w-full text-sm text-[#1e3a8a]"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#2663eb] transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors['confirmPassword'] && (
            <p id="rp-confirm-error" role="alert" className="text-red-600 text-xs mt-1">
              {errors['confirmPassword']}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#2663eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-3 font-bold tracking-widest uppercase text-sm transition-colors flex items-center justify-center gap-2"
        >
          {submitting && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {submitting ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      <p className="text-center text-sm text-[#475569] mt-6">
        <Link to="/login" className="text-[#2663eb] font-bold hover:underline">
          ← Back to Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
