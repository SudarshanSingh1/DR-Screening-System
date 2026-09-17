import type { StaffProfile } from '../../types/staff';

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "";
const API_BASE = `${BASE_URL}/api/staff`;

export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.error ?? 'Request failed'), { code: data.code });
  }
  return data;
}

export const staffApi = {
  getProfile: async (): Promise<StaffProfile | null> => {
    try {
      const res = await fetchApi('/profile');
      if (res.success && res.data) {
        return res.data as StaffProfile;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  getDashboardMetrics: async (): Promise<any> => {
    try {
      const res = await fetchApi('/dashboard/metrics');
      return res.data;
    } catch (e) {
      return null;
    }
  }
};
