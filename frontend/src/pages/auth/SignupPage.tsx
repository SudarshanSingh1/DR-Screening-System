import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RoleSelector } from '../../components/auth/RoleSelector';
import { MobileOtpForm } from '../../components/auth/MobileOtpForm';
import { EmailPasswordForm } from '../../components/auth/EmailPasswordForm';
import type { UserRole, SessionUser } from '../../types/auth';

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-[#475569] font-medium uppercase tracking-widest">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export function SignupPage() {
  const [role, setRole] = useState<UserRole>('patient');
  const [registeredUser, setRegisteredUser] = useState<SessionUser | null>(null);
  const navigate = useNavigate();

  const isPrimaryOtp = role === 'patient' || role === 'screening_staff';

  const handleOtpSuccess = (phone: string) => {
    navigate('/verify-otp', { state: { phone } });
  };

  if (registeredUser) {
    return (
      <AuthLayout
        panel={{
          eyebrow: 'REGISTRATION COMPLETE',
          heading: 'Your Account is Ready',
          bullets: [
            'Secure access to screening information',
            'AI-powered screening insights',
            'Track relevant screening activity over time',
          ],
        }}
      >
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-2">
          Success
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-4">
          Account created successfully!
        </h1>
        <p className="text-sm text-[#475569] leading-relaxed mb-8">
          Welcome to Vision AI Platform, <span className="font-bold text-[#1e3a8a]">{registeredUser.firstName}</span>. Your account has been created successfully. You can now begin your AI-powered screening journey.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-[#2663eb] hover:bg-[#1d4ed8] text-white rounded-lg py-3 font-bold tracking-widest uppercase text-sm transition-colors"
        >
          Proceed to Login
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      wide
      panel={{
        eyebrow: 'JOIN THE PLATFORM',
        heading: 'Start Your AI-Powered Screening Journey',
        bullets: [
          'Patients: track your retinal health over time',
          'Screening staff: capture and manage fundus images',
          'Doctors: review AI insights and validate diagnoses',
          'Admins: manage platform, users, and infrastructure',
          'Government identity verification integration (configurable)',
        ],
      }}
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-2">
        Create Account
      </p>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-2">
        Join the Vision AI Platform
      </h1>
      <p className="text-sm text-[#475569] leading-relaxed mb-6">
        Create your account to access AI-powered diabetic retinopathy screening services.
      </p>

      {/* Role selector */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1e3a8a] mb-3">I am a</p>
        <RoleSelector selectedRole={role} onChange={setRole} />
      </div>

      <div className="h-px bg-gray-100 mb-6" />

      {/* Auth methods — order based on role */}
      {isPrimaryOtp ? (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1e3a8a] mb-3">
            Verify with Mobile OTP
          </p>
          <MobileOtpForm onSuccess={handleOtpSuccess} />
          <OrDivider />
          <p className="text-xs font-bold uppercase tracking-widest text-[#1e3a8a] mb-3">
            Or register with Email
          </p>
          <EmailPasswordForm mode="signup" role={role} onSuccess={setRegisteredUser} />
        </>
      ) : (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1e3a8a] mb-3">
            Register with Email
          </p>
          <EmailPasswordForm mode="signup" role={role} onSuccess={setRegisteredUser} />
          <OrDivider />
          <p className="text-xs font-bold uppercase tracking-widest text-[#1e3a8a] mb-3">
            Or verify with Mobile OTP
          </p>
          <MobileOtpForm onSuccess={handleOtpSuccess} />
        </>
      )}

      {/* DigiLocker — configuration-unavailable state */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1e3a8a] mb-2">
          Verify Identity (Optional)
        </p>
        <div className="bg-[#F0F7FF] border border-[#bfdbfe] rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-[#475569] leading-relaxed">
            Identity verification is currently unavailable. This feature will be enabled after
            authorized integration configuration is complete.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-400 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest opacity-50 cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            DigiLocker
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-400 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest opacity-50 cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            Meri Pehchaan
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-[#475569] mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-[#2663eb] font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
