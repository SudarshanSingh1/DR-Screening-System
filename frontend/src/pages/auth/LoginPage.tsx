import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RoleSelector } from '../../components/auth/RoleSelector';
import { MobileOtpForm } from '../../components/auth/MobileOtpForm';
import { EmailPasswordForm } from '../../components/auth/EmailPasswordForm';
import type { UserRole } from '../../types/auth';

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-[#475569] font-medium uppercase tracking-widest">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

type LoginTab = 'otp' | 'email';

export function LoginPage() {
  const [role, setRole] = useState<UserRole>('patient');
  const [activeTab, setActiveTab] = useState<LoginTab>('otp');
  const navigate = useNavigate();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setActiveTab(newRole === 'patient' || newRole === 'screening_staff' ? 'otp' : 'email');
  };

  const handleOtpSuccess = (phone: string) => {
    navigate('/verify-otp', { state: { phone } });
  };

  const handleLoginSuccess = (user?: any) => {
    if (user?.role === 'patient') {
      navigate('/patient/dashboard');
    } else if (user?.role === 'engineer_admin' || user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'screening_staff') {
      navigate('/staff/dashboard');
    } else if (user?.role === 'doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/');
    }
  };

  const tabClass = (tab: LoginTab) =>
    `flex-1 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-colors border-b-2 focus:outline-none ${
      activeTab === tab
        ? 'border-[#2663eb] text-[#2663eb]'
        : 'border-transparent text-[#475569] hover:text-[#2663eb]'
    }`;

  return (
    <AuthLayout
      panel={{
        eyebrow: 'SECURE ACCESS',
        heading: 'Your AI-Powered Retinal Screening Dashboard',
        bullets: [
          'Role-based access for patients, staff, doctors, and admins',
          'Industry-standard encrypted authentication',
          'Seamless integration with your clinical workflow',
          'Human-in-the-loop doctor review and validation',
          'Offline-capable for rural screening deployments',
        ],
      }}
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#2663eb] mb-2">
        Welcome Back
      </p>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-2">
        Sign In to Vision AI
      </h1>
      <p className="text-sm text-[#475569] leading-relaxed mb-6">
        Access the diabetic retinopathy screening platform based on your authorized role.
      </p>

      {/* Role selector */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1e3a8a] mb-3">I am a</p>
        <RoleSelector selectedRole={role} onChange={handleRoleChange} />
      </div>

      {/* Method tabs */}
      <div className="flex border-b border-gray-200 mb-6" role="tablist">
        <button role="tab" aria-selected={activeTab === 'otp'} onClick={() => setActiveTab('otp')} className={tabClass('otp')}>
          Mobile + OTP
        </button>
        <button role="tab" aria-selected={activeTab === 'email'} onClick={() => setActiveTab('email')} className={tabClass('email')}>
          Email + Password
        </button>
      </div>

      {/* OTP panel */}
      <div id="tab-otp" role="tabpanel" hidden={activeTab !== 'otp'}>
        {activeTab === 'otp' && (
          <>
            <MobileOtpForm onSuccess={handleOtpSuccess} />
            <OrDivider />
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className="w-full border-2 border-[#2663eb] text-[#2663eb] hover:bg-blue-50 rounded-lg py-3 text-xs font-extrabold uppercase tracking-widest transition-colors"
            >
              Continue with Email
            </button>
          </>
        )}
      </div>

      {/* Email panel */}
      <div id="tab-email" role="tabpanel" hidden={activeTab !== 'email'}>
        {activeTab === 'email' && (
          <>
            <EmailPasswordForm mode="login" onSuccess={handleLoginSuccess} />
            <OrDivider />
            <button
              type="button"
              onClick={() => setActiveTab('otp')}
              className="w-full border-2 border-[#2663eb] text-[#2663eb] hover:bg-blue-50 rounded-lg py-3 text-xs font-extrabold uppercase tracking-widest transition-colors"
            >
              Continue with OTP
            </button>
          </>
        )}
      </div>

      {/* Security info */}
      <div className="mt-6 bg-[#F0F7FF] border border-[#bfdbfe] rounded-xl px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-[#2663eb] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        <div>
          <p className="text-xs font-bold text-[#1e3a8a] mb-0.5">Secure Authentication</p>
          <p className="text-xs text-[#475569] leading-relaxed">
            We use industry-standard encryption to keep your data safe and secure.
          </p>
        </div>
      </div>

      <p className="text-center text-sm text-[#475569] mt-8">
        New to Vision AI?{' '}
        <Link to="/signup" className="text-[#2663eb] font-bold hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
