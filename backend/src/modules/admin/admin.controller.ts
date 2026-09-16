import { Request, Response } from 'express';
import * as adminService from './admin.service';
import type { ProvisionStaffInput, ProvisionDoctorInput } from './admin.schema';

function ip(req: any): string {
  return (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace(/^::ffff:/, '');
}

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; code?: string; status?: number };
  const status = e.status ?? 500;
  const code = e.code ?? 'INTERNAL_ERROR';
  
  let error = status < 500 ? (e.message ?? 'Request failed.') : 'An unexpected error occurred.';
  if (process.env.NODE_ENV !== 'production' && status === 500 && e.message) {
    error = e.message;
  }
  
  res.status(status).json({ success: false, error, code });
}

export async function provisionStaff(req: Request<unknown, unknown, ProvisionStaffInput>, res: Response) {
  try {
    const adminId = req.session.user?.id;
    if (!adminId) throw Object.assign(new Error('Unauthorized'), { status: 401 });

    const data = await adminService.provisionStaff(adminId, req.body, ip(req));
    res.status(201).json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
}

export async function provisionDoctor(req: Request<unknown, unknown, ProvisionDoctorInput>, res: Response) {
  try {
    const adminId = req.session.user?.id;
    if (!adminId) throw Object.assign(new Error('Unauthorized'), { status: 401 });

    const data = await adminService.provisionDoctor(adminId, req.body, ip(req));
    res.status(201).json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getDashboardMetrics(req: Request, res: Response) {
  try {
    const metrics = await adminService.getDashboardMetrics();
    res.status(200).json({ success: true, data: metrics });
  } catch (err) { handleError(err, res); }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await adminService.getUsers();
    res.status(200).json({ success: true, data: users });
  } catch (err) { handleError(err, res); }
}

export async function getDoctors(req: Request, res: Response) {
  try {
    const doctors = await adminService.getDoctors();
    res.status(200).json({ success: true, data: doctors });
  } catch (err) { handleError(err, res); }
}

export async function getStaff(req: Request, res: Response) {
  try {
    const staff = await adminService.getStaff();
    res.status(200).json({ success: true, data: staff });
  } catch (err) { handleError(err, res); }
}

export async function getPatients(req: Request, res: Response) {
  try {
    const patients = await adminService.getPatients();
    res.status(200).json({ success: true, data: patients });
  } catch (err) { handleError(err, res); }
}

export async function deletePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'Patient ID required' });
    await adminService.deletePatient(id as string);
    res.status(200).json({ success: true, message: 'Patient successfully deleted/deactivated' });
  } catch (err) { handleError(err, res); }
}

export async function getScreenings(req: Request, res: Response) {
  try {
    const screenings = await adminService.getScreenings();
    res.status(200).json({ success: true, data: screenings });
  } catch (err) { handleError(err, res); }
}

export async function getFacilities(req: Request, res: Response) {
  try {
    const facilities = await adminService.getFacilities();
    res.status(200).json({ success: true, data: facilities });
  } catch (err) { handleError(err, res); }
}

export async function createFacility(req: Request, res: Response) {
  try {
    const data = await adminService.createFacility(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function assignFacility(req: Request, res: Response) {
  try {
    const { userId, facilityId } = req.body;
    if (!userId || !facilityId) {
      return res.status(400).json({ success: false, error: 'userId and facilityId are required', code: 'VALIDATION_ERROR' });
    }
    const data = await adminService.assignFacility({ userId, facilityId });
    res.status(200).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}
