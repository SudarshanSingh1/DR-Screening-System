import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OtpVerificationPage } from './pages/auth/OtpVerificationPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { IdentityVerificationPage } from './pages/auth/IdentityVerificationPage';
import { AccountActivationPage } from './pages/auth/AccountActivationPage';

import { PatientLayout } from './components/patient/PatientLayout';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { ScreeningHistory } from './pages/patient/ScreeningHistory';
import { ScreeningDetails } from './pages/patient/ScreeningDetails';
import { PatientFeedback } from './pages/patient/PatientFeedback';
import { PatientNotifications } from './pages/patient/PatientNotifications';
import { PatientProfile } from './pages/patient/PatientProfile';
import { PatientSettings } from './pages/patient/PatientSettings';

import { StaffLayout } from './components/staff/StaffLayout';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { FindPatient } from './pages/staff/FindPatient';
import { RegisterPatient } from './pages/staff/RegisterPatient';
import { NewScreeningWorkspace } from './pages/staff/workspace/NewScreeningWorkspace';
import { ScreeningResult } from './pages/staff/workspace/ScreeningResult';
import { ScreeningsList } from './pages/staff/ScreeningsList';
import { DoctorsFacilities } from './pages/staff/DoctorsFacilities';
import { StaffProfilePage } from './pages/staff/StaffProfilePage';

import { PlatformFeedback } from './pages/PlatformFeedback';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFacilities } from './pages/admin/AdminFacilities';
import { AdminSimpleList } from './pages/admin/AdminSimpleList';
import { AdminPatients } from './pages/admin/AdminPatients';

import { DoctorLayout } from './components/doctor/DoctorLayout';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorReview } from './pages/doctor/DoctorReview';
import { DoctorReviewsPending } from './pages/doctor/DoctorReviewsPending';
import { DoctorReviewsCompleted } from './pages/doctor/DoctorReviewsCompleted';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { DoctorReports } from './pages/doctor/DoctorReports';
import { DoctorProfile } from './pages/doctor/DoctorProfile';
import { DoctorNotifications } from './pages/doctor/DoctorNotifications';

import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <BrowserRouter>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/identity-verification" element={<IdentityVerificationPage />} />
        <Route path="/activate" element={<AccountActivationPage />} />
        
        {/* Patient Panel Routes */}
        <Route path="/patient" element={<PatientLayout />}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<PatientDashboard />} />
           <Route path="screenings" element={<ScreeningHistory />} />
           <Route path="screenings/:id" element={<ScreeningDetails />} />
           <Route path="feedback" element={<PatientFeedback />} />
           <Route path="notifications" element={<PatientNotifications />} />
           <Route path="profile" element={<PatientProfile />} />
           <Route path="settings" element={<PatientSettings />} />
        </Route>

        
        {/* Admin Panel Routes */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="users" element={<AdminSimpleList type="users" />} />
           <Route path="doctors" element={<AdminSimpleList type="doctors" />} />
           <Route path="staff" element={<AdminSimpleList type="staff" />} />
           <Route path="patients" element={<AdminPatients />} />
           <Route path="screenings" element={<AdminSimpleList type="screenings" />} />
           <Route path="facilities" element={<AdminFacilities />} />
        </Route>

        {/* Staff Panel Routes */}

        <Route path="/staff" element={<StaffLayout />}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<StaffDashboard />} />
           
           <Route path="patients/search" element={<FindPatient />} />
           <Route path="patients/register" element={<RegisterPatient />} />
           
           <Route path="screenings/new" element={<NewScreeningWorkspace />} />
           <Route path="screenings/in-progress" element={<ScreeningsList status="IN_PROGRESS" />} />
           <Route path="screenings/completed" element={<ScreeningsList status="COMPLETED" />} />
           <Route path="screenings/:id/result" element={<ScreeningResult />} />
           
           <Route path="directory" element={<DoctorsFacilities />} />
           
           <Route path="profile" element={<StaffProfilePage />} />
        </Route>

        {/* Doctor Panel Routes */}
        <Route path="/doctor" element={<DoctorLayout />}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<DoctorDashboard />} />
           <Route path="screenings/:id/review" element={<DoctorReview />} />
           <Route path="reviews/pending" element={<DoctorReviewsPending />} />
           <Route path="reviews/completed" element={<DoctorReviewsCompleted />} />
           <Route path="patients" element={<DoctorPatients />} />
           <Route path="reports" element={<DoctorReports />} />
           <Route path="profile" element={<DoctorProfile />} />
           <Route path="notifications" element={<DoctorNotifications />} />

        </Route>

        <Route path="/platform-feedback" element={<PlatformFeedback />} />
      </Routes>
      </BrowserRouter>
      </LanguageProvider>
    </ToastProvider>
  );
}

export default App;
