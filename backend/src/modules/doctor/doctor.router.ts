import { Router } from 'express';
import { requireSession, requireRole } from '../../middleware/auth.middleware';
import * as doctorController from './doctor.controller';

export const doctorRouter = Router();

doctorRouter.use(requireSession);
doctorRouter.use(requireRole('doctor'));

doctorRouter.get("/search", doctorController.search);

doctorRouter.get('/dashboard', doctorController.getDashboardMetrics);
doctorRouter.get('/reviews/pending', doctorController.getPendingReviews);
doctorRouter.get('/reviews/completed', doctorController.getCompletedReviews);
doctorRouter.get('/screenings/:id', doctorController.getScreeningDetails);
doctorRouter.post('/screenings/:id/review', doctorController.submitReview);
doctorRouter.get('/patients', doctorController.getPatients);
doctorRouter.get('/reports', doctorController.getReports);
doctorRouter.get('/profile', doctorController.getProfile);
doctorRouter.put('/profile', doctorController.updateProfile);
