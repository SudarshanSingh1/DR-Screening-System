// Authentication domain types for Vision AI Platform
// These types define the shape of auth data — no actual auth logic lives here.

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

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  primaryAuth: AuthMethod;
  icon: string; // lucide icon name
}

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
  maskedPhone?: string;
  maskedEmail?: string;
}

export interface RegisterPayload {
  firstName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberDevice?: boolean;
}
