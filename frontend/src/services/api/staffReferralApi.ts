import type { ReferralSummary } from '../../types/staff';
import { fetchApi } from './staffApi';

export const staffReferralApi = {
  getReferrals: async (status?: 'PENDING' | 'COMPLETED'): Promise<ReferralSummary[]> => {
    try {
      const url = status ? `/referrals?status=${status}` : '/referrals';
      const res = await fetchApi(url);
      return res.data || [];
    } catch (e) {
      throw e;
    }
  },

  createReferral: async (screeningId: string, facilityId: string, doctorId?: string): Promise<{ id: string }> => {
    try {
      const res = await fetchApi('/referrals', {
        method: 'POST',
        body: JSON.stringify({ screeningId, facilityId, doctorId }),
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  },
  
  generateReport: async (screeningId: string): Promise<{ url: string }> => {
    try {
      const res = await fetchApi(`/reports/generate`, {
        method: 'POST',
        body: JSON.stringify({ screeningId }),
      });
      return res.data; // e.g. a URL to a generated PDF
    } catch (e) {
      throw e;
    }
  }
};
