import type { PatientFeedbackSummary } from '../../types/staff';
import { fetchApi } from './staffApi';

export const staffFeedbackApi = {
  getPatientFeedback: async (): Promise<PatientFeedbackSummary[]> => {
    try {
      const res = await fetchApi('/patient-feedback');
      return res.data || [];
    } catch (e) {
      throw e;
    }
  }
};
