const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api/platform-feedback';

async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error ?? 'Request failed'), { code: data.code });
  return data;
}

export interface PlatformFeedbackSubmission {
  category: string;
  text: string;
  screeningId?: string;
  caseReferenceId?: string;
}

export const platformFeedbackApi = {
  submitFeedback: async (feedback: PlatformFeedbackSubmission): Promise<void> => {
    await fetchApi('/', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },
  getMyFeedback: async (): Promise<any[]> => {
    const res = await fetchApi('/my-feedback');
    return res.data;
  }
};
