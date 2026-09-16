import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { OtpInputGroup } from '../../components/auth/OtpInputGroup';
import { sendOtp, verifyOtp } from '../../services/authService';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN_SECONDS = 60;

/** Mask phone: show only last 5 digits, e.g. +91 XXXXX 12345 */
function maskPhone(phone: string): string {
  if (phone.length < 5) return phone;
  const last5 = phone.slice(-5);
  const masked = 'X'.repeat(Math.max(0, phone.length - 5));
  return `+91 ${masked.slice(0, 5)} ${last5}`;
}

interface LocationState {
  phone?: string;
}

export function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = (location.state as LocationState)?.phone ?? '';

  const [otp, setOtp] = useState<string[]>(Array<string>(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [resendError, setResendError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleVerify = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setVerifyError('');
      const code = otp.join('');
      if (code.length < OTP_LENGTH) {
        setVerifyError('Please enter all 6 digits.');
        return;
      }
      setVerifying(true);
      try {
        const res = await verifyOtp(phone, code);
        const user = res.data;
        if (user?.role === 'patient') {
          navigate('/patient/dashboard');
        } else if (user?.role === 'screening_staff' || user?.role === 'engineer_admin') {
          navigate('/staff/dashboard');
        } else if (user?.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/');
        }
      } catch (err: any) {
        setVerifyError(err.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    },
    [otp, phone],
  );

  const handleResend = async () => {
    setResendError('');
    setResending(true);
    try {
      await sendOtp(phone);
      setCountdown(RESEND_COUNTDOWN_SECONDS);
      setCanResend(false);
    } catch {
      setResendError(
        'OTP service unavailable. Backend integration is required.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout panel={{ eyebrow: "VERIFY YOUR IDENTITY", heading: "Secure Mobile Verification", bullets: ["Enter the 6-digit OTP sent to your mobile", "Code expires based on backend security policy", "Request a new code if yours has expired", "Your session will be created after verification"] }}>
      {/* Eyebrow */}
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-2">
        Verify Mobile Number
      </p>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-2">
        Enter Verification Code
      </h1>

      {/* Description */}
      <p className="text-sm text-[#475569] leading-relaxed mb-8">
        A 6-digit code was sent to{' '}
        <span className="font-bold text-[#1e3a8a]">
          {phone ? maskPhone(phone) : 'your registered mobile number'}
        </span>
        .
      </p>

      <form onSubmit={handleVerify} noValidate>
        {verifyError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5"
          >
            {verifyError}
          </div>
        )}

        <OtpInputGroup value={otp} onChange={setOtp} length={OTP_LENGTH} />

        <button
          type="submit"
          disabled={verifying}
          className="w-full mt-8 bg-[#2663eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-3 font-bold tracking-widest uppercase text-sm transition-colors flex items-center justify-center gap-2"
        >
          {verifying && (
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
          {verifying ? 'Verifying…' : 'Verify & Continue'}
        </button>
      </form>

      {/* Resend section */}
      <div className="mt-6 text-center">
        {resendError && (
          <p role="alert" className="text-red-600 text-xs mb-2">
            {resendError}
          </p>
        )}
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        ) : (
          <p className="text-xs text-[#475569]">
            Resend OTP in{' '}
            <span className="font-bold text-[#1e3a8a]">{countdown}s</span>
          </p>
        )}
      </div>

      {/* Change number */}
      <p className="text-center text-sm text-[#475569] mt-6">
        <Link to="/login" className="text-[#2663eb] font-bold hover:underline">
          ← Change mobile number
        </Link>
      </p>
    </AuthLayout>
  );
}
