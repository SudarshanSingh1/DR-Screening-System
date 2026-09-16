import type { Request, Response } from 'express';
import * as patientService from './patient.service';
import type { AuthApiResponse } from '../../types/auth';
import type { RequestEmailVerificationInput, VerifyEmailCodeInput, ResendEmailVerificationInput } from './patient.schema';
import { prisma } from '../../db/prisma';

function ip(req: any): string {
  return (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace(/^::ffff:/, '');
}

function handleError(err: unknown, res: Response<AuthApiResponse>): void {
  const e = err as { message?: string; code?: string; status?: number };
  const status = e.status ?? 500;
  const code = e.code ?? 'INTERNAL_ERROR';
  
  let error = status < 500 ? (e.message ?? 'Request failed.') : 'An unexpected error occurred.';

  if (status >= 500) console.error('[patient.controller]', err);
  res.status(status).json({ success: false, error, code });
}

export async function getProfile(req: Request, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Not authenticated'), { status: 401 });
    
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw Object.assign(new Error('Patient profile not found'), { status: 404 });
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    res.status(200).json({ 
      success: true, 
      data: {
        id: patient.id, // Using patient ID for the frontend profile
        userId: user?.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        age: patient.age,
        gender: patient.gender,
        preferredLanguage: patient.preferredLanguage,
        aadhaarNumber: patient.aadhaarReference,
        avatarColor: patient.avatarColor,
        // Canonical auth states from User model
        email: user?.email,
        phone: user?.phone,
        emailVerified: user?.emailVerified,
        pendingEmail: user?.pendingEmail
      } 
    });
  } catch (err) {
    handleError(err, res);
  }
}

export async function requestEmailVerification(req: Request<unknown, AuthApiResponse, RequestEmailVerificationInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Not authenticated'), { status: 401 });
    
    const data = await patientService.requestEmailVerification(userId, req.body, ip(req));
    res.status(200).json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
}

export async function verifyEmailCode(req: Request<unknown, AuthApiResponse, VerifyEmailCodeInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Not authenticated'), { status: 401 });

    await patientService.verifyEmailCode(userId, req.body, ip(req));
    res.status(200).json({ success: true });
  } catch (err) {
    handleError(err, res);
  }
}

export async function resendEmailVerification(req: Request<unknown, AuthApiResponse, ResendEmailVerificationInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Not authenticated'), { status: 401 });

    await patientService.resendEmailVerification(userId, req.body, ip(req));
    res.status(200).json({ success: true });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getScreenings(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Not authenticated'), { status: 401 });

    const { getPatientScreenings } = await import('./patient.screening.service');
    const screenings = await getPatientScreenings(userId);
    res.status(200).json({ success: true, data: screenings });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getScreeningDetails(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Not authenticated'), { status: 401 });

    const { getScreeningDetails: getDetails } = await import('./patient.screening.service');
    const screening = await getDetails(userId, req.params.id as string);
    res.status(200).json({ success: true, data: screening });
  } catch (err) {
    handleError(err, res);
  }
}
