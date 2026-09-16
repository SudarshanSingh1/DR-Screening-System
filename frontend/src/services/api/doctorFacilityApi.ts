import type { DoctorSummary, FacilitySummary } from '../../types/staff';
import { fetchApi } from './staffApi';

export const doctorFacilityApi = {
  getFacilities: async (query?: string): Promise<FacilitySummary[]> => {
    try {
      const url = query ? `/facilities?q=${encodeURIComponent(query)}` : '/facilities';
      const res = await fetchApi(url);
      return res.data || [];
    } catch (e) {
      throw e;
    }
  },

  getDoctors: async (facilityId?: string): Promise<DoctorSummary[]> => {
    try {
      const url = facilityId ? `/doctors?facilityId=${facilityId}` : '/doctors';
      const res = await fetchApi(url);
      return res.data || [];
    } catch (e) {
      throw e;
    }
  }
};
