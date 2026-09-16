import type { Request, Response } from 'express';
import * as service from './patient-feedback.service';
import type { CreatePatientFeedbackInput } from './patient-feedback.schema';
import { prisma } from '../../db/prisma';

export async function createFeedback(req: Request<unknown, any, CreatePatientFeedbackInput>, res: Response): Promise<void> {
  try {
    const patientId = req.session.user?.id;
    if (!patientId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
    
    const feedback = await service.createFeedback(patientId, req.body);
    
    await prisma.auditLog.create({
      data: { event: 'PATIENT_FEEDBACK_SUBMITTED', userId: patientId, metadata: { feedbackId: feedback.id } }
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || 'Internal error' });
  }
}

export async function getFeedbacks(req: Request, res: Response): Promise<void> {
  try {
    const patientId = req.session.user?.id;
    if (!patientId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
    
    const data = await service.getFeedbacks(patientId);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
}

export async function getFeedbackById(req: Request, res: Response): Promise<void> {
  try {
    const patientId = req.session.user?.id;
    if (!patientId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
    
    const data = await service.getFeedbackById(patientId, req.params.id as string);
    if (!data) { res.status(404).json({ success: false, error: 'Not found' }); return; }

    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
}
