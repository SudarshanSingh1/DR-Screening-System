import type { PatientSummaryForStaff, PatientRegistrationPayload } from '../../types/staff';
import { fetchApi } from './staffApi';

export const staffPatientApi = {
  searchPatients: async (query: string, options?: RequestInit): Promise<PatientSummaryForStaff[]> => {
    if (!query) return [];
    try {
      const res = await fetchApi(`/patients/search?q=${encodeURIComponent(query)}`, options);
      return res.data || [];
    } catch (e) {
      throw e;
    }
  },

  registerPatient: async (payload: PatientRegistrationPayload): Promise<{ id: string }> => {
    try {
      const res = await fetchApi('/patients', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data; // { id: patient.id }
    } catch (e) {
      throw e;
    }
  },
  
  getPatientDetails: async (patientId: string): Promise<PatientSummaryForStaff | null> => {
    try {
      const res = await fetchApi(`/patients/${patientId}`);
      return res.data;
    } catch (e) {
      return null;
    }
  }
};
