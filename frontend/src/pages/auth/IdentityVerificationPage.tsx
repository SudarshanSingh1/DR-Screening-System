import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { startDigiLocker, startMeriPehchaan } from '../../services/authService';
import type { VerificationStatus } from '../../types/auth';

const UNAVAILABLE_MSG =
  'Integration not configured. This feature requires authorized credentials configured on the backend.';

interface ProviderCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  status: VerificationStatus;
  onContinue: () => Promise<unknown>;
}

function ProviderCard({
  title,
  description,
  buttonLabel,
  status,
  onContinue,
}: ProviderCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setError('');
    setLoading(true);
    try {
      await onContinue();
    } catch {
      setError(UNAVAILABLE_MSG);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#bfdbfe] p-6 flex flex-col gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-1">
          {title}
        </p>
        <p className="text-sm text-[#475569] leading-relaxed">{description}</p>
      </div>

      {(status === 'config_unavailable' || error) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <p className="text-xs text-amber-800 leading-relaxed">
            {error || UNAVAILABLE_MSG}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-[#2663eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-bold tracking-widest uppercase text-xs transition-colors flex items-center justify-center gap-2"
      >
        {loading && (
          <svg
            className="animate-spin h-3.5 w-3.5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {loading ? 'Redirecting…' : buttonLabel}
      </button>
    </div>
  );
}

export function IdentityVerificationPage() {
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');

  const handleAadhaar = async () => {
    setAadhaarError('');
    setAadhaarLoading(true);
    try {
      // Aadhaar uses the same flow as DigiLocker ecosystem
      await startDigiLocker();
    } catch {
      setAadhaarError(
        'Aadhaar-based verification requires authorized UIDAI ecosystem integration. Direct Aadhaar authentication is not implemented.',
      );
    } finally {
      setAadhaarLoading(false);
    }
  };

  return (
    <AuthLayout wide panel={{ eyebrow: "GOVERNMENT IDENTITY", heading: "Secure Identity Verification", bullets: ["DigiLocker integration (requires authorized requester credentials)", "Meri Pehchaan — government OAuth provider", "Aadhaar verification via authorized UIDAI ecosystem", "Your identity data is never stored by Vision AI", "Consent-based, privacy-first design"] }}>
      {/* Eyebrow */}
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-2">
        Identity Verification
      </p>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-2">
        Verify Your Identity
      </h1>

      {/* Description */}
      <p className="text-sm text-[#475569] leading-relaxed mb-8">
        Use an approved identity service to securely verify your identity with your consent.
      </p>

      {/* Provider cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <ProviderCard
          title="DigiLocker"
          description="Verify selected identity or professional documents through DigiLocker with your explicit consent."
          buttonLabel="Continue with DigiLocker"
          status="config_unavailable"
          onContinue={startDigiLocker}
        />
        <ProviderCard
          title="Meri Pehchaan"
          description="Government identity verification through Meri Pehchaan platform."
          buttonLabel="Continue with Meri Pehchaan"
          status="config_unavailable"
          onContinue={startMeriPehchaan}
        />
      </div>

      {/* Aadhaar section */}
      <div className="bg-white rounded-2xl border border-[#bfdbfe] p-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-4">
          Aadhaar Identity Verification
        </p>

        {/* Privacy notice */}
        <div className="bg-[#F0F7FF] border border-[#bfdbfe] rounded-xl px-4 py-3 mb-5">
          <p className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wide mb-1">
            Your Privacy Matters
          </p>
          <p className="text-xs text-[#475569] leading-relaxed">
            Your Aadhaar information is not stored by VISION AI. Identity verification is
            completed only through an authorized verification ecosystem.
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-3 mb-5" aria-label="Aadhaar verification steps">
          {[
            'Initiate Request',
            'Verify with Authorized Provider',
            'Identity Verified',
          ].map((step, idx) => (
            <li key={step} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2663eb]/10 text-[#2663eb] flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs text-[#475569] font-medium uppercase tracking-wide">
                {step}
              </span>
            </li>
          ))}
        </ol>

        {aadhaarError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
            <p className="text-xs text-amber-800 leading-relaxed">{aadhaarError}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleAadhaar}
          disabled={aadhaarLoading}
          className="w-full bg-[#2663eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-bold tracking-widest uppercase text-xs transition-colors flex items-center justify-center gap-2"
        >
          {aadhaarLoading && (
            <svg
              className="animate-spin h-3.5 w-3.5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {aadhaarLoading ? 'Connecting…' : 'Continue to Secure Verification'}
        </button>

        <p className="text-xs text-[#475569] mt-4 leading-relaxed">
          <span className="font-bold text-[#1e3a8a]">Important:</span> Aadhaar-based
          verification requires authorized UIDAI ecosystem integration. Direct Aadhaar
          authentication is not implemented.
        </p>
      </div>

      <p className="text-center text-sm text-[#475569] mt-8">
        <Link to="/login" className="text-[#2663eb] font-bold hover:underline">
          ← Back to Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
