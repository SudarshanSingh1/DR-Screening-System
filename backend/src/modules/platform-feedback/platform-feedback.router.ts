import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { requireSession, requireRole } from '../../middleware/auth.middleware';
import { createFeedback, getMyFeedbacks, getFeedbackById } from './platform-feedback.controller';
import { CreatePlatformFeedbackSchema } from './platform-feedback.schema';

const router = Router();

// Only STAFF and DOCTOR roles can access these routes
router.use(requireSession, requireRole('screening_staff', 'doctor'));

router.post('/', validate(CreatePlatformFeedbackSchema), createFeedback);
router.get('/my-feedback', getMyFeedbacks);
router.get('/:id', getFeedbackById);

export { router as platformFeedbackRouter };
