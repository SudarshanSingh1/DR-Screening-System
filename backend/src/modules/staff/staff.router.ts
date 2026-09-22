import { Router } from 'express';
import multer from 'multer';
import { requireSession, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { getProfile, searchPatients, getDashboardMetrics, createPatient, getPatientDetails, getRecentScreenings, getReferrals, createReferral, generateReport, getPatientFeedback, getStaffFacilities, getStaffDoctors } from './staff.controller';
import { createScreening, getScreenings, getScreeningDetails, cancelScreening, uploadScreeningImage, startScreeningAnalysis, getScreeningResult, analyzeScreening } from '../screening/screening.controller';
import { CreateScreeningSchema } from '../screening/screening.schema';
import { CreatePatientSchema } from './staff.schema';

const upload = multer({ 
  dest: '/tmp/uploads/'
});

const router = Router();

// Strict Staff Authorization
// Only SCREENING_STAFF and ENGINEER_ADMIN can access these routes
router.use(requireSession, requireRole('screening_staff', 'engineer_admin'));

router.get('/profile', getProfile);
router.get('/dashboard/metrics', getDashboardMetrics);
router.get('/dashboard/recent-screenings', getRecentScreenings);
router.get('/patients/search', searchPatients);
router.post('/patients', validate(CreatePatientSchema), createPatient);
router.get('/patients/:id', getPatientDetails);

router.post('/screenings', validate(CreateScreeningSchema), createScreening);
router.get('/screenings', getScreenings);
router.get('/screenings/:id', getScreeningDetails);
router.post('/screenings/:id/cancel', cancelScreening);
router.post('/screenings/:id/images', uploadScreeningImage);
router.post('/screenings/:id/start', startScreeningAnalysis);
router.post('/screenings/:id/analyze', upload.fields([
  { name: 'leftEyeImage', maxCount: 1 },
  { name: 'rightEyeImage', maxCount: 1 }
]), analyzeScreening);
router.get('/screenings/:id/result', getScreeningResult);
router.post('/screenings/:id/referral-report', require('..'+'/screening/screening.controller').generateReferralReport);

router.get('/referrals', getReferrals);
router.post('/referrals', createReferral);
router.post('/reports/generate', generateReport);
router.get('/patient-feedback', getPatientFeedback);

export { router as staffRouter };

router.get('/facilities', getStaffFacilities);
router.get('/doctors', getStaffDoctors);
