import type { Request, Response } from 'express';
import * as service from './platform-feedback.service';
import type { CreatePlatformFeedbackInput } from './platform-feedback.schema';
import { prisma } from '../../db/prisma';

export async function createFeedback(req: Request<unknown, any, CreatePlatformFeedbackInput>, res: Response): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
    
    const feedback = await service.createFeedback(userId, req.body);
    
    await prisma.auditLog.create({
      data: { event: 'PLATFORM_FEEDBACK_SUBMITTED', userId, metadata: { feedbackId: feedback.id } }
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || 'Internal error' });
  }
}

export async function getMyFeedbacks(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
    
    const data = await service.getMyFeedbacks(userId);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
}

export async function getFeedbackById(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
    
    const data = await service.getFeedbackById(userId, req.params.id as string);
    if (!data) { res.status(404).json({ success: false, error: 'Not found' }); return; }

    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
}
