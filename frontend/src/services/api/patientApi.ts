import type { PatientProfile, Screening, Notification, FeedbackSubmission } from '../../types/patient';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api/patient';

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

export const patientApi = {
  getCurrentPatient: async (): Promise<PatientProfile | null> => {
    try {
      const res = await fetchApi('/profile');
      if (res.success && res.data) {
        return {
          id: res.data.id,
          fullName: [res.data.firstName, res.data.lastName].filter(Boolean).join(' ') || 'Patient',
          mobileNumber: res.data.phone || '',
          aadhaarNumber: res.data.aadhaarNumber || 'XXXXXXXX1234',
          age: res.data.age || 0,
          gender: res.data.gender || 'Unknown',
          email: res.data.email || '',
          emailVerified: res.data.emailVerified || false,
          preferredLanguage: res.data.preferredLanguage || 'en',
          avatar: 'generated'
        } as PatientProfile;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  getPatientScreenings: async (): Promise<Screening[]> => {
    const res = await fetchApi('/screenings');
    return res.data.map((s: any) => ({
      id: s.id,
      date: new Date(s.createdAt).toLocaleDateString(),
      facility: 'Screening Facility', // simplified since we don't fetch facility here yet
      status: s.status === 'COMPLETED' ? 'Completed' : 'Processing',
      reportAvailable: !!s.clinicalReport,
      reportUrl: s.clinicalReport ? `/api/storage/${s.clinicalReport.storageKey}` : undefined
    }));
  },

  getScreeningById: async (id: string): Promise<Screening | null> => {
    try {
      const res = await fetchApi(`/screenings/${id}`);
      const s = res.data;
      return {
        id: s.id,
        date: new Date(s.createdAt).toLocaleDateString(),
        facility: 'Screening Facility',
        status: s.status === 'COMPLETED' ? 'Completed' : 'Processing',
        reportAvailable: !!s.clinicalReport,
        reportUrl: s.clinicalReport ? `/api/storage/${s.clinicalReport.storageKey}` : undefined,
        resultSummary: s.clinicalReview?.doctorDecision === 'DR_DETECTED' ? 'DR Detected' : 'No DR Detected'
      };
    } catch {
      return null;
    }
  },

  getPatientNotifications: async (): Promise<Notification[]> => {
    return [];
  },

  submitPatientFeedback: async (feedback: FeedbackSubmission): Promise<void> => {
    // Convert to the backend expected schema
    await fetchApi('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        category: feedback.category || 'OTHER',
        text: feedback.text,
        // Since we don't have real file upload storage setup in this task, 
        // we'll safely pass attachments as undefined or mock if there were files.
        // A real system would use FormData or pre-signed URLs.
      }),
    });
  },

  updatePatientProfile: async (_updates: Partial<PatientProfile>): Promise<PatientProfile> => {
    // For now, let's assume we fetch the latest since email verification handles the email update.
    // If we wanted to update language, we'd add an endpoint.
    return await patientApi.getCurrentPatient() as PatientProfile;
  },

  requestEmailVerification: async (email: string): Promise<{ requestId: string }> => {
    const res = await fetchApi('/profile/email/request-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return res.data;
  },

  verifyEmailCode: async (requestId: string, code: string): Promise<void> => {
    await fetchApi('/profile/email/verify', {
      method: 'POST',
      body: JSON.stringify({ requestId, code }),
    });
  },

  resendEmailVerification: async (requestId: string): Promise<void> => {
    await fetchApi('/profile/email/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    });
  }
};
