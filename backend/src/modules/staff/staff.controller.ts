import { Request, Response } from 'express';
import * as screeningService from '../screening/screening.service';

import * as staffService from './staff.service';
import { PatientSearchSchema, PatientSearchQuery } from './staff.schema';

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; code?: string; status?: number };
  const status = e.status ?? 500;
  const code = e.code ?? 'INTERNAL_ERROR';
  
  let error = status < 500 ? (e.message ?? 'Request failed.') : 'An unexpected error occurred.';
  // Only reveal true message in dev or if explicitly marked safe
  if (process.env.NODE_ENV !== 'production' && status === 500 && e.message) {
    error = e.message;
  }
  
  res.status(status).json({ success: false, error, code });
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    const profile = await staffService.getStaffProfile(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    handleError(err, res);
  }
}

export async function searchPatients(req: Request<unknown, unknown, unknown, any>, res: Response) {
  try {
    // Validate query
    const result = PatientSearchSchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ success: false, error: 'Invalid search query', code: 'VALIDATION_ERROR' });
      return;
    }
    const query = result.data.q;
    const results = await staffService.searchPatients(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getDashboardMetrics(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    const metrics = await staffService.getDashboardMetrics(userId);
    res.status(200).json({ success: true, data: metrics });
  } catch (err) {
    handleError(err, res);
  }
}


export async function createPatient(req: Request, res: Response) {
  try {
    const staffId = req.session.user?.id || '';
    const result = await staffService.createPatient(staffId, req.body, req.ip ?? req.socket.remoteAddress ?? 'unknown');
    res.status(201).json({ success: true, data: { id: result.patient.id, userId: result.user?.id } });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getPatientDetails(req: Request, res: Response) {
  try {
    const staffId = req.session.user?.id;
    if (!staffId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    
    const { id } = req.params;
    const patient = await staffService.getPatientDetails(id as string);
    res.status(200).json({ success: true, data: patient });
  } catch (err) {
    handleError(err, res);
  }
}


export async function getRecentScreenings(req: Request, res: Response) {
  try {
    const staffId = req.session.user?.id;
    if (!staffId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    
    const results = await screeningService.getScreeningsForStaff(staffId, 5, 0);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getReferrals(req: Request, res: Response) {
  res.status(501).json({ success: false, code: 'REFERRALS_NOT_AVAILABLE', error: 'Referral domain is not implemented.' });
}

export async function createReferral(req: Request, res: Response) {
  res.status(501).json({ success: false, code: 'REFERRALS_NOT_AVAILABLE', error: 'Referral domain is not implemented.' });
}

export async function generateReport(req: Request, res: Response) {
  res.status(501).json({ success: false, code: 'REPORT_GENERATION_NOT_AVAILABLE', error: 'Report generation is not implemented.' });
}

export async function getPatientFeedback(req: Request, res: Response) {
  // Staff cannot safely access global patient feedback without facility-level authorization.
  res.status(403).json({ success: false, code: 'FORBIDDEN', error: 'Facility-level access control is required to view patient feedback.' });
}

export async function getStaffFacilities(req: Request, res: Response) {
  try {
    const facilities = await staffService.getFacilities();
    res.status(200).json({ success: true, data: facilities });
  } catch (err) { handleError(err, res); }
}

export async function getStaffDoctors(req: Request, res: Response) {
  try {
    const doctors = await staffService.getDoctors();
    res.status(200).json({ success: true, data: doctors });
  } catch (err) { handleError(err, res); }
}
