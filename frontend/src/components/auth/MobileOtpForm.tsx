import { useState } from 'react';
import { sendOtp } from '../../services/authService';

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

interface MobileOtpFormProps {
  onSuccess: (phone: string) => void;
  isLoading?: boolean;
}

export function MobileOtpForm({ onSuccess, isLoading = false }: MobileOtpFormProps) {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const cleaned = phone.trim();
    if (!cleaned) {
      setPhoneError('Mobile number is required.');
      return false;
    }
    if (!INDIAN_PHONE_REGEX.test(cleaned)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number starting with 6–9.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServiceError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await sendOtp(phone.trim());
      onSuccess(phone.trim());
    } catch {
      setServiceError(
        'OTP service unavailable. Backend integration is required.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serviceError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4"
        >
          {serviceError}
        </div>
      )}

      <div className="flex gap-2 mb-1">
        {/* Country selector */}
        <div className="flex-shrink-0">
          <label htmlFor="country-code" className="sr-only">
            Country code
          </label>
          <select
            id="country-code"
            className="border border-gray-200 rounded-xl px-3 py-3 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none text-sm text-[#1e3a8a] bg-white h-full"
            defaultValue="+91"
            aria-label="Country dialing code"
          >
            <option value="+91">🇮🇳 +91</option>
          </select>
        </div>

        {/* Phone input */}
        <div className="flex-1">
          <label htmlFor="mobile-number" className="sr-only">
            Mobile number
          </label>
          <input
            id="mobile-number"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
              if (phoneError) setPhoneError('');
              if (serviceError) setServiceError('');
            }}
            aria-describedby={phoneError ? 'phone-error' : undefined}
            aria-invalid={!!phoneError}
            autoComplete="tel-national"
            className="border border-gray-200 rounded-xl px-4 py-3 focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none w-full text-sm text-[#1e3a8a]"
          />
        </div>
      </div>

      {phoneError && (
        <p id="phone-error" role="alert" className="text-red-600 text-xs mt-1 mb-2">
          {phoneError}
        </p>
      )}

      <p className="text-xs text-[#475569] mb-4">
        India (+91) · 10-digit number starting with 6–9
      </p>

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
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {busy ? 'Sending OTP…' : 'Send OTP'}
      </button>
    </form>
  );
}
