import { Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs';
import * as doctorService from './doctor.service';
import { prisma } from '../../db/prisma';
import path from 'path';
import { getFilePath } from '../../utils/storage';
import { generateClinicalReportPDF } from '../../utils/pdf';

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; code?: string; status?: number };
  const status = e.status ?? 500;
  const code = e.code ?? 'INTERNAL_ERROR';
  res.status(status).json({ success: false, error: e.message || 'Request failed.', code });
}

export async function getDashboardMetrics(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const metrics = await doctorService.getDashboardMetrics(userId);
    res.status(200).json({ success: true, data: metrics });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getPendingReviews(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const reviews = await doctorService.getPendingReviews(userId);
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getCompletedReviews(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const reviews = await doctorService.getCompletedReviews(userId);
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getScreeningDetails(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const screening = await doctorService.getScreeningDetails(userId, req.params.id as string);
    res.status(200).json({ success: true, data: screening });
  } catch (err) {
    handleError(err, res);
  }
}

const ReviewSchema = z.object({
  doctorDecision: z.enum(['DR_DETECTED', 'NO_DR_DETECTED']),
  clinicalNotes: z.string().optional(),
  recommendation: z.string().optional(),
  followUp: z.string().optional()
});

export async function submitReview(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId || req.session.user?.role !== 'doctor') {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }

    const { doctorDecision, clinicalNotes, recommendation, followUp } = ReviewSchema.parse(req.body);
    const screeningId = req.params.id as string;

    // Verify screening exists and is authorized for this doctor
    const screening = await doctorService.getScreeningDetails(userId, screeningId);

    if (screening.status !== 'PENDING_REVIEW') {
      throw Object.assign(new Error('Screening is not pending review'), { status: 400 });
    }

    const doctorProfile = await doctorService.getDoctorProfile(userId);

    // ── Step 1: DB transaction — review + status only, no I/O ────────────────
    const { review } = await prisma.$transaction(async (tx) => {
      // Duplicate review guard inside transaction to handle concurrent submissions
      const existing = await tx.clinicalReview.findUnique({ where: { screeningId } });
      if (existing) {
        throw Object.assign(new Error('This screening has already been reviewed'), { status: 409 });
      }

      const review = await tx.clinicalReview.create({
        data: { screeningId, reviewerId: userId, doctorDecision, clinicalNotes, recommendation, followUp }
      });

      await tx.screening.update({
        where: { id: screeningId },
        data: { status: 'COMPLETED' }
      });

      return { review };
    });

    // ── Step 2: Generate PDF outside transaction ───────────────────────────────
    const reportKey = `reports/${screeningId}-${Date.now()}.pdf`;
    const pdfPath = getFilePath(reportKey);
    const reportDir = path.dirname(pdfPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    let report = null;
    try {
      await generateClinicalReportPDF(screening, screening.patient, doctorProfile, review, pdfPath);

      // ── Step 3: Persist ClinicalReport record ─────────────────────────────
      report = await prisma.clinicalReport.create({
        data: { screeningId, reviewId: review.id, storageKey: reportKey }
      });
    } catch (pdfErr) {
      // Review and COMPLETED status are committed — do not roll back.
      // Log the failure for an admin to re-generate later if needed.
      console.error('[submitReview] PDF generation failed after review commit:', pdfErr);
    }

    res.status(200).json({
      success: true,
      data: { review, screening: { id: screeningId, status: 'COMPLETED' }, report }
    });
  } catch (err) {
    handleError(err, res);
  }
}

export async function reanalyzeScreening(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId || req.session.user?.role !== 'doctor') {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }

    const screeningId = req.params.id as string;
    const screening = await doctorService.getScreeningDetails(userId, screeningId);

    const leftImg = screening.images.find(img => img.eye === 'LEFT');
    const rightImg = screening.images.find(img => img.eye === 'RIGHT');

    if (!leftImg || !rightImg || !leftImg.storageKey || !rightImg.storageKey) {
      throw Object.assign(new Error('Original images not found for this screening'), { status: 400 });
    }

    const { provideEvidence } = await import('../inference/evidence.provider');
    const leftFilePath = getFilePath(leftImg.storageKey);
    const rightFilePath = getFilePath(rightImg.storageKey);

    const [leftEyeResult, rightEyeResult] = await Promise.all([
      provideEvidence(leftFilePath, leftImg.originalName || 'left.jpg'),
      provideEvidence(rightFilePath, rightImg.originalName || 'right.jpg')
    ]);

    const aiResultData = { 
      leftEye: {
        prediction: { classIndex: leftEyeResult.grade, label: leftEyeResult.gradeLabel, confidence: leftEyeResult.confidence },
        probabilities: leftEyeResult.probabilities,
        isReferable: leftEyeResult.referable,
        gradCam: leftEyeResult.gradCamEvidence,
        vesselEvidence: leftEyeResult.vesselEvidence,
        discFoveaEvidence: leftEyeResult.discFoveaEvidence,
        lesionEvidence: leftEyeResult.lesionEvidence,
        gradCamEvidence: leftEyeResult.gradCamEvidence
      }, 
      rightEye: {
        prediction: { classIndex: rightEyeResult.grade, label: rightEyeResult.gradeLabel, confidence: rightEyeResult.confidence },
        probabilities: rightEyeResult.probabilities,
        isReferable: rightEyeResult.referable,
        gradCam: rightEyeResult.gradCamEvidence,
        vesselEvidence: rightEyeResult.vesselEvidence,
        discFoveaEvidence: rightEyeResult.discFoveaEvidence,
        lesionEvidence: rightEyeResult.lesionEvidence,
        gradCamEvidence: rightEyeResult.gradCamEvidence
      } 
    };

    await prisma.screening.update({
      where: { id: screeningId },
      data: {
        aiResult: aiResultData as any
      }
    });

    res.status(200).json({ 
      success: true, 
      data: aiResultData
    });

  } catch (err) {
    handleError(err, res);
  }
}



export async function getPatients(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const patients = await doctorService.getPatients(userId);
    res.status(200).json({ success: true, data: patients });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getReports(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const reports = await doctorService.getReports(userId);
    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const profile = await doctorService.getDoctorProfile(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    handleError(err, res);
  }
}

const ProfileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  professionalName: z.string().optional(),
  specialty: z.string().optional(),
  registrationNumber: z.string().optional()
});

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const data = ProfileUpdateSchema.parse(req.body);
    const updated = await doctorService.updateProfile(userId, data);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    handleError(err, res);
  }
}

export async function search(req: Request, res: Response) {
  try {
    const userId = req.session.user?.id;
    const q = req.query.q as string;
    if (!userId) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const data = await doctorService.search(userId, q || '');
    res.status(200).json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
}
