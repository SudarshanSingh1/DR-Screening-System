import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loginUser, registerUser } from '../../services/authService';
import { PasswordStrength, isPasswordStrong } from './PasswordStrength';
import type { UserRole } from '../../types/auth';

interface EmailPasswordFormProps {
  mode: 'login' | 'signup';
  onSuccess?: (user?: any) => void;
  isLoading?: boolean;
}

export function EmailPasswordForm({
  mode,
  onSuccess,
  role = 'patient',
  isLoading = false,
}: EmailPasswordFormProps & { role?: UserRole }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceError, setServiceError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'signup' && !firstName.trim()) {
      newErrors['firstName'] = 'First name is required.';
    }

    if (!email.trim()) {
      newErrors['email'] = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors['email'] = 'Enter a valid email address.';
    }

    if (!password) {
      newErrors['password'] = 'Password is required.';
    } else if (mode === 'signup' && !isPasswordStrong(password)) {
      newErrors['password'] = 'Password does not meet all requirements.';
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        newErrors['confirmPassword'] = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        newErrors['confirmPassword'] = 'Passwords do not match.';
      }
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
      if (mode === 'login') {
        const res = await loginUser({ email: email.trim(), password, rememberDevice });
        onSuccess?.(res.data);
      } else {
        const res = await registerUser({ firstName: firstName.trim(), email: email.trim(), password, role });
        onSuccess?.(res.data);
      }
    } catch {
      setServiceError(
        'Authentication service unavailable. Backend integration is required.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serviceError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
        >
          {serviceError}
        </div>
      )}

      {/* First Name (signup only) */}
      {mode === 'signup' && (
        <div>
          <label
            htmlFor="ep-firstname"
            className="block text-xs font-bold text-[#1e3a8a] mb-1 uppercase tracking-wide"
          >
            First Name
          </label>
          <input
            id="ep-firstname"
            type="text"
            placeholder="Your first name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors['firstName']) setErrors((prev) => ({ ...prev, firstName: '' }));
            }}
            aria-describedby={errors['firstName'] ? 'ep-firstname-error' : undefined}
            aria-invalid={!!errors['firstName']}
            autoComplete="given-name"
            className="border border-gray-200 rounded-xl px-4 py-3 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none w-full text-sm text-[#1e3a8a]"
          />
          {errors['firstName'] && (
            <p id="ep-firstname-error" role="alert" className="text-red-600 text-xs mt-1">
              {errors['firstName']}
            </p>
          )}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="ep-email"
          className="block text-xs font-bold text-[#1e3a8a] mb-1 uppercase tracking-wide"
        >
          Email Address
        </label>
        <input
          id="ep-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors['email']) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          aria-describedby={errors['email'] ? 'ep-email-error' : undefined}
          aria-invalid={!!errors['email']}
          autoComplete="email"
          className="border border-gray-200 rounded-xl px-4 py-3 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none w-full text-sm text-[#1e3a8a]"
        />
        {errors['email'] && (
          <p id="ep-email-error" role="alert" className="text-red-600 text-xs mt-1">
            {errors['email']}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="ep-password"
            className="block text-xs font-bold text-[#1e3a8a] uppercase tracking-wide"
          >
            Password
          </label>
          {mode === 'login' && (
            <Link
              to="/forgot-password"
              className="text-xs text-[#2663eb] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <input
            id="ep-password"
            type={showPassword ? 'text' : 'password'}
            placeholder={mode === 'signup' ? 'Create a strong password' : 'Your password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors['password']) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            aria-describedby={errors['password'] ? 'ep-password-error' : undefined}
            aria-invalid={!!errors['password']}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="border border-gray-200 rounded-xl px-4 py-3 pr-11 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none w-full text-sm text-[#1e3a8a]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#2663eb] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors['password'] && (
          <p id="ep-password-error" role="alert" className="text-red-600 text-xs mt-1">
            {errors['password']}
          </p>
        )}
        {mode === 'signup' && password && <PasswordStrength password={password} />}
      </div>

      {/* Confirm password (signup only) */}
      {mode === 'signup' && (
        <div>
          <label
            htmlFor="ep-confirm"
            className="block text-xs font-bold text-[#1e3a8a] mb-1 uppercase tracking-wide"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="ep-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors['confirmPassword'])
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              aria-describedby={
                errors['confirmPassword'] ? 'ep-confirm-error' : undefined
              }
              aria-invalid={!!errors['confirmPassword']}
              autoComplete="new-password"
              className="border border-gray-200 rounded-xl px-4 py-3 pr-11 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none w-full text-sm text-[#1e3a8a]"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#2663eb] transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors['confirmPassword'] && (
            <p id="ep-confirm-error" role="alert" className="text-red-600 text-xs mt-1">
              {errors['confirmPassword']}
            </p>
          )}
        </div>
      )}

      {/* Remember device (login only) */}
      {mode === 'login' && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="rounded border-gray-300 text-[#2663eb] focus:ring-[#2663eb]"
          />
          <span className="text-xs text-[#475569]">Remember this device</span>
        </label>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#2663eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-3 font-bold tracking-widest uppercase text-sm transition-colors flex items-center justify-center gap-2"
      >
        {busy && (
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
        {busy
          ? mode === 'login'
            ? 'Signing in…'
            : 'Creating account…'
          : mode === 'login'
            ? 'Sign In'
            : 'Create Account'}
      </button>
    </form>
  );
}
