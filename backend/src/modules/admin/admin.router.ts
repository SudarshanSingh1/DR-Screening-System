import { Router } from 'express';
import { requireSession, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { ProvisionStaffSchema, ProvisionDoctorSchema } from './admin.schema';
import * as adminController from './admin.controller';

const router = Router();

router.use(requireSession, requireRole('engineer_admin', 'admin'));

router.post('/staff', validate(ProvisionStaffSchema), adminController.provisionStaff);
router.post('/doctors', validate(ProvisionDoctorSchema), adminController.provisionDoctor);

router.get('/dashboard/metrics', adminController.getDashboardMetrics);
router.get('/users', adminController.getUsers);
router.get('/doctors', adminController.getDoctors);
router.get('/staff', adminController.getStaff);
router.get('/patients', adminController.getPatients);
router.delete('/patients/:id', adminController.deletePatient);
router.get('/screenings', adminController.getScreenings);
router.get('/facilities', adminController.getFacilities);
router.post('/facilities', adminController.createFacility);
router.post('/facilities/assign', adminController.assignFacility);

export { router as adminRouter };
