export interface StaffProfile {
  id: string;
  professionalName: string;
  designation?: string;
  facilityId?: string;
  facilityName?: string;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface PatientSummaryForStaff {
  id: string;
  firstName: string;
  lastName?: string;
  age?: number;
  gender?: string;
  phone?: string;
  aadhaarReference?: string;
  email?: string;
}

export interface PatientRegistrationPayload {
  firstName: string;
  lastName?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  aadhaarReference?: string;
}

export type ScreeningTaskStatus = 'QUEUED' | 'IMAGE_PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ScreeningTask {
  id: string;
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  status: ScreeningTaskStatus;
  createdAt?: string;
  date?: string;
  updatedAt: string;
}

export interface EyeInferenceResult {
  success?: boolean;
  prediction: {
    classIndex: number;
    label: string;
    confidence: number;
  };
  probabilities: number[];
  isReferable: boolean;
  isLowConfidence: boolean;
  gradCam?: string;
  evidence?: {
    quality?: { image: string, label: string };
    vessel?: { image: string, label: string };
    discFovea?: { image: string, label: string };
    lesion?: { image: string, label: string };
    gradCam?: { image: string, label: string };
  };
}

export interface BilateralInferenceResult {
  leftEye: EyeInferenceResult;
  rightEye: EyeInferenceResult;
}

export interface ScreeningResultOutput {
  id: string;
  screeningId: string;
  status: string;
  aiOutput?: BilateralInferenceResult; // Update to strict bilateral type
  confidenceScore?: number;
  recommendation?: string;
  date: string;
}

export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface ReferralSummary {
  id: string;
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  referredToFacilityId: string;
  referredToDoctorId?: string;
  status: ReferralStatus;
  date: string;
}

export interface DoctorSummary {
  id: string;
  userId: string;
  professionalName: string;
  specialty?: string;
  facilityId?: string;
  facility?: FacilitySummary;
  registrationNumber?: string;
  authorizationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacilitySummary {
  id: string;
  name: string;
  location?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientFeedbackSummary {
  id: string;
  category: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED';
  textPreview?: string;
  hasVoice: boolean;
  hasImage: boolean;
  submittedAt: string;
}
