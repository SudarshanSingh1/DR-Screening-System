import type { ScreeningTask, ScreeningResultOutput } from '../../types/staff';
import { fetchApi } from './staffApi';

export const staffScreeningApi = {
  getScreenings: async (status?: 'IN_PROGRESS' | 'COMPLETED'): Promise<ScreeningTask[]> => {
    try {
      const url = status ? `/screenings?status=${status}` : '/screenings';
      const res = await fetchApi(url);
      return res.data || [];
    } catch (e) {
      throw e;
    }
  },

  createScreening: async (patientId: string): Promise<{ id: string }> => {
    try {
      const res = await fetchApi('/screenings', {
        method: 'POST',
        body: JSON.stringify({ patientId }),
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  },

  analyzeScreening: async (screeningId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file);
    
    // fetchApi usually stringifies json, so we use raw fetch for FormData
    const BASE_URL = (import.meta.env.VITE_API_URL as string) || "";
const API_BASE = `${BASE_URL}/api/staff`;
    const res = await fetch(`${API_BASE}/screenings/${screeningId}/analyze`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw Object.assign(new Error(data.error ?? 'Request failed'), { code: data.code });
    }
    return data.data;
  },

  // Legacy stubs (now returning 501s from backend)
  uploadImage: async (screeningId: string, eye: 'LEFT' | 'RIGHT', file: File): Promise<void> => {
    await fetchApi(`/screenings/${screeningId}/images`, {
      method: 'POST',
      body: JSON.stringify({ eye, fileName: file.name }),
    });
  },

  startAnalysis: async (screeningId: string): Promise<void> => {
    await fetchApi(`/screenings/${screeningId}/start`, { method: 'POST' });
  },

  getScreeningResult: async (screeningId: string): Promise<ScreeningResultOutput | null> => {
    try {
      const res = await fetchApi(`/screenings/${screeningId}/result`);
      return res.data;
    } catch (e) {
      return null;
    }
  }
};
