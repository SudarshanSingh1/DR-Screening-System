/**
 * Auth service for Vision AI Platform.
 * Communicates with the Node.js authentication backend via relative '/api/auth' paths,
 * relying on Nginx reverse proxy (production) or Vite proxy (development).
 * Uses 'include' credentials for HTTP-only session cookies.
 */

import type { AuthApiResponse, LoginPayload, RegisterPayload, SessionUser } from '../types/auth';

// Default to relative '/api/auth' which routes through the Nginx reverse proxy in production/Docker.
// Allows override via VITE_API_BASE_URL for local Vite dev server.
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api/auth';

/** Standardized fetch wrapper to handle errors gracefully */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<AuthApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Send cookies (session)
    });

    const data = (await res.json()) as AuthApiResponse<T>;

    if (!res.ok) {
      // If the backend returned a structured error, use its message
      throw Object.assign(new Error(data.error ?? 'Request failed'), { code: data.code });
    }

    return data;
  } catch (error) {
    // If it's already an error with a code (thrown above), rethrow it
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    // Network or parsing errors
    throw Object.assign(new Error('Network error. Ensure the backend server is running.'), {
      code: 'NETWORK_ERROR',
    });
  }
}

export const sendOtp = async (phone: string): Promise<AuthApiResponse> => {
  return fetchApi('/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
};

export const verifyOtp = async (phone: string, otp: string): Promise<AuthApiResponse<SessionUser>> => {
  return fetchApi<SessionUser>('/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
};

export const registerUser = async (data: RegisterPayload): Promise<AuthApiResponse<SessionUser>> => {
  return fetchApi<SessionUser>('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const loginUser = async (data: LoginPayload): Promise<AuthApiResponse<SessionUser>> => {
  return fetchApi<SessionUser>('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const forgotPassword = async (email: string): Promise<AuthApiResponse> => {
  return fetchApi('/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token: string, password: string): Promise<AuthApiResponse> => {
  return fetchApi('/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword: password }),
  });
};

export const startDigiLocker = async (): Promise<AuthApiResponse<{ url: string }>> => {
  return fetchApi<{ url: string }>('/identity/digilocker/init', {
    method: 'POST',
  });
};

export const startMeriPehchaan = async (): Promise<AuthApiResponse<{ url: string }>> => {
  return fetchApi<{ url: string }>('/identity/meri-pehchaan/init', {
    method: 'POST',
  });
};

export const getSession = async (): Promise<AuthApiResponse<SessionUser>> => {
  return fetchApi<SessionUser>('/session', {
    method: 'GET',
  });
};

export const logout = async (): Promise<AuthApiResponse> => {
  return fetchApi('/logout', {
    method: 'POST',
  });
};

export const activateAccount = async (
  token: string,
  password: string,
): Promise<AuthApiResponse<{ role: string }>> => {
  return fetchApi<{ role: string }>('/activate', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
};
