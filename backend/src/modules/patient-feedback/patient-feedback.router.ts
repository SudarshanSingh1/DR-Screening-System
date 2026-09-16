import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { requireSession, requireRole } from '../../middleware/auth.middleware';
import { createFeedback, getFeedbacks, getFeedbackById } from './patient-feedback.controller';
import { CreatePatientFeedbackSchema } from './patient-feedback.schema';

const router = Router();

// Only PATIENT role can access these routes
router.use(requireSession, requireRole('patient'));

router.post('/', validate(CreatePatientFeedbackSchema), createFeedback);
router.get('/', getFeedbacks);
router.get('/:id', getFeedbackById);

export { router as patientFeedbackRouter };
