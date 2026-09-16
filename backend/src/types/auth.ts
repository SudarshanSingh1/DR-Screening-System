// Mirror of frontend src/types/auth.ts — kept in sync manually.
// Backend uses these to produce consistent API responses.

export type UserRole = 'patient' | 'screening_staff' | 'doctor' | 'engineer_admin';
export type AuthMethod = 'mobile_otp' | 'email_password';
export type IdentityProvider = 'digilocker' | 'meri_pehchaan' | 'aadhaar';
export type VerificationStatus =
  | 'idle'
  | 'redirecting'
  | 'in_progress'
  | 'verified'
  | 'cancelled'
  | 'failed'
  | 'config_unavailable';

export interface AuthApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface SessionUser {
  id: string;
  firstName: string | null;
  role: UserRole;
  status: 'pending_verification' | 'active' | 'suspended';
  /** masked for display only — never full number */
  maskedPhone?: string;
  /** masked for display only — never full address */
  maskedEmail?: string;
}

// Augment Express session type
declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}
