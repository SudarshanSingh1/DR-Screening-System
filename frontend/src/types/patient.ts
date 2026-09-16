export interface PatientProfile {
  id: string;
  fullName?: string;
  mobileNumber?: string;
  aadhaarNumber?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  email?: string;
  emailVerified?: boolean;
  preferredLanguage?: 'en' | 'hi';
  avatar?: string;
}

export type ScreeningStatus = 'Processing' | 'Completed' | 'Reviewing';

export interface Screening {
  id: string;
  date: string;
  facility: string;
  status: ScreeningStatus;
  resultSummary?: string;
  reportAvailable: boolean;
  reportUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface FeedbackSubmission {
  category?: string;
  text?: string;
  audioBlob?: Blob;
  imageFile?: File;
}
