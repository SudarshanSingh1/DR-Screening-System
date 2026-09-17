const BASE_URL = (import.meta.env.VITE_API_URL as string) || "";
const API_BASE = `${BASE_URL}/api/doctor`;

async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
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

export const doctorApi = {
  search: async (query: string) => {
    const res = await fetchApi(`/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  getDashboardMetrics: async () => {
    const res = await fetchApi('/dashboard');
    return res.data;
  },

  getPendingReviews: async () => {
    const res = await fetchApi('/reviews/pending');
    return res.data;
  },

  getCompletedReviews: async () => {
    const res = await fetchApi('/reviews/completed');
    return res.data;
  },

  getScreeningDetails: async (id: string) => {
    const res = await fetchApi(`/screenings/${id}`);
    return res.data;
  },

  submitReview: async (id: string, decision: 'DR_DETECTED' | 'NO_DR_DETECTED', notes?: string) => {
    const res = await fetchApi(`/screenings/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ doctorDecision: decision, clinicalNotes: notes })
    });
    return res.data;
  },

  getPatients: async () => {
    const res = await fetchApi('/patients');
    return res.data;
  },
  
  getReports: async () => {
    const res = await fetchApi('/reports');
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await fetchApi("/profile", {
      method: "PUT",
      body: JSON.stringify(data)
    });
    return res.data;
  },

  getProfile: async () => {
    const res = await fetchApi('/profile');
    return res.data;
  }
};
