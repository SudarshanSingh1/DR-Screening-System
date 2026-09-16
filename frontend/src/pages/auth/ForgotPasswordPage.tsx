import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { forgotPassword } from '../../services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProgressStep({
  step,
  label,
  active,
}: {
  step: number;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-colors ${
          active
            ? 'bg-[#2663eb] border-[#2663eb] text-white'
            : 'bg-white border-gray-300 text-gray-400'
        }`}
        aria-current={active ? 'step' : undefined}
      >
        {step}
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-wide text-center leading-tight ${
          active ? 'text-[#2663eb]' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServiceError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
    } catch (err: any) {
      setServiceError(err.message || 'Failed to request password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout panel={{ eyebrow: "ACCOUNT RECOVERY", heading: "Recover Your Vision AI Account", bullets: ["Enter your registered email address", "A secure reset link will be sent to your inbox", "Reset token validity is enforced by the backend", "Contact your administrator if you need further help"] }}>
      {/* Eyebrow */}
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-2">
        Reset Password
      </p>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-2">
        Recover Your Account
      </h1>

      {/* Description */}
      <p className="text-sm text-[#475569] leading-relaxed mb-6">
        Enter your registered email address to receive a secure password reset link.
      </p>

      {/* Progress steps */}
      <div className="flex items-start mb-8" role="list" aria-label="Reset password steps">
        <ProgressStep step={1} label="Verify Email" active={true} />
        <div className="flex-shrink-0 mt-3.5 flex-1 h-px bg-gray-200 max-w-[3rem] mx-auto" />
        <ProgressStep step={2} label="Reset Password" active={false} />
        <div className="flex-shrink-0 mt-3.5 flex-1 h-px bg-gray-200 max-w-[3rem] mx-auto" />
        <ProgressStep step={3} label="Done" active={false} />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {serviceError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4"
          >
            {serviceError}
          </div>
        )}

        <div className="mb-5">
          <label
            htmlFor="fp-email"
            className="block text-xs font-bold text-[#1e3a8a] mb-1 uppercase tracking-wide"
          >
            Registered Email
          </label>
          <input
            id="fp-email"
            type="email"
            placeholder="Enter your registered email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
              if (serviceError) setServiceError('');
            }}
            aria-describedby={emailError ? 'fp-email-error' : undefined}
            aria-invalid={!!emailError}
            autoComplete="email"
            className="border border-gray-200 rounded-xl px-4 py-3 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none w-full text-sm text-[#1e3a8a]"
          />
          {emailError && (
            <p id="fp-email-error" role="alert" className="text-red-600 text-xs mt-1">
              {emailError}
            </p>
          )}
        </div>

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
          {submitting ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      {/* Security info */}
      <div className="mt-5 bg-[#F0F7FF] border border-[#bfdbfe] rounded-xl px-4 py-3 flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#2663eb] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-[#1e3a8a] mb-0.5">Secure & Safe</p>
          <p className="text-xs text-[#475569] leading-relaxed">
            We'll send a password reset link to your registered email. Link expiry is
            determined by backend security configuration.
          </p>
        </div>
      </div>

      {/* Back to login */}
      <p className="text-center text-sm text-[#475569] mt-8">
        <Link to="/login" className="text-[#2663eb] font-bold hover:underline">
          ← Back to Sign In
        </Link>
      </p>

      <p className="text-center text-xs text-[#475569] mt-3">
        Need help? Contact your administrator or support team.
      </p>
    </AuthLayout>
  );
}
