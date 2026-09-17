const BASE_URL = (import.meta.env.VITE_API_URL as string) || "";
const API_BASE = `${BASE_URL}/api/admin`;

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

export const adminApi = {
  getDashboardMetrics: async () => {
    const res = await fetchApi('/dashboard/metrics');
    return res.data;
  },
  getUsers: async () => {
    const res = await fetchApi('/users');
    return res.data;
  },
  getDoctors: async () => {
    const res = await fetchApi('/doctors');
    return res.data;
  },
  getStaff: async () => {
    const res = await fetchApi('/staff');
    return res.data;
  },
  getPatients: async () => {
    const res = await fetchApi('/patients');
    return res.data;
  },
  deletePatient: async (id: string) => {
    const res = await fetchApi(`/patients/${id}`, { method: 'DELETE' });
    return res.data;
  },
  getScreenings: async () => {
    const res = await fetchApi('/screenings');
    return res.data;
  },
  getFacilities: async () => {
    const res = await fetchApi('/facilities');
    return res.data;
  },
  createFacility: async (data: { name: string, location?: string }) => {
    const res = await fetchApi('/facilities', { method: 'POST', body: JSON.stringify(data) });
    return res.data;
  }
};
