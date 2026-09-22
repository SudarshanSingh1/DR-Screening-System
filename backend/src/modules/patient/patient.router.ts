import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { requireSession, requireRole } from '../../middleware/auth.middleware';
import { requestEmailVerification, verifyEmailCode, resendEmailVerification, getProfile } from './patient.controller';
import { RequestEmailVerificationSchema, VerifyEmailCodeSchema, ResendEmailVerificationSchema } from './patient.schema';

const router = Router();

// Get profile (patient only)
router.get('/profile', requireSession, requireRole('patient'), getProfile);

// Email Verification (requires active patient session)
router.post('/profile/email/request-verification', requireSession, requireRole('patient'), validate(RequestEmailVerificationSchema), requestEmailVerification);
router.post('/profile/email/verify', requireSession, requireRole('patient'), validate(VerifyEmailCodeSchema), verifyEmailCode);
router.post('/profile/email/resend-verification', requireSession, requireRole('patient'), validate(ResendEmailVerificationSchema), resendEmailVerification);

// Screenings
import { getScreenings, getScreeningDetails, generateInitialReport } from './patient.controller';
router.get('/screenings', requireSession, requireRole('patient'), getScreenings);
router.get('/screenings/:id', requireSession, requireRole('patient'), getScreeningDetails);
router.post('/screenings/:id/report', requireSession, requireRole('patient'), generateInitialReport);

export { router as patientRouter };
