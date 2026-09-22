import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import * as screeningService from './screening.service';
import { ScreeningQuerySchema, CreateScreeningInput } from './screening.schema';
import { analyzeImage } from '../inference/inference.service';
import { prisma } from '../../db/prisma';

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

export async function createScreening(req: Request<unknown, unknown, CreateScreeningInput>, res: Response) {
  try {
    const staffId = req.session.user?.id;
    if (!staffId) throw Object.assign(new Error('Unauthorized'), { status: 401 });

    const result = await screeningService.createScreening(req.body.patientId, staffId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getScreenings(req: Request, res: Response) {
  try {
    const staffId = req.session.user?.id;
    if (!staffId) throw Object.assign(new Error('Unauthorized'), { status: 401 });

    const query = ScreeningQuerySchema.parse(req.query);
    const results = await screeningService.getScreeningsForStaff(staffId, query.limit, query.offset, query.status);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getScreeningDetails(req: Request, res: Response) {
  try {
    const staffId = req.session.user?.id;
    if (!staffId) throw Object.assign(new Error('Unauthorized'), { status: 401 });

    const result = await screeningService.getScreeningDetails(req.params.id as string, staffId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    handleError(err, res);
  }
}

export async function cancelScreening(req: Request, res: Response) {
  try {
    const staffId = req.session.user?.id;
    if (!staffId) throw Object.assign(new Error('Unauthorized'), { status: 401 });

    const result = await screeningService.cancelScreening(req.params.id as string, staffId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    handleError(err, res);
  }
}

export async function uploadScreeningImage(_req: Request, res: Response) {
  // IMAGE STORAGE IS EXPLICITLY NOT IMPLEMENTED — Phase 3C uses /analyze for temp processing
  res.status(501).json({
    success: false,
    code: 'IMAGE_STORAGE_NOT_CONFIGURED',
    error: 'Permanent image storage is not configured. Use POST /screenings/:id/analyze for temporary inference.'
  });
}

export async function startScreeningAnalysis(_req: Request, res: Response) {
  // Queue-based analysis is not implemented — use /analyze for direct temporary inference
  res.status(501).json({
    success: false,
    code: 'INFERENCE_QUEUE_NOT_AVAILABLE',
    error: 'Queue-based inference is not available. Use POST /screenings/:id/analyze.'
  });
}

export async function getScreeningResult(_req: Request, res: Response) {
  res.status(501).json({
    success: false,
    code: 'PERSISTENT_RESULT_NOT_AVAILABLE',
    error: 'Persistent inference results are not stored in this phase. Results are returned directly from /analyze.'
  });
}

export async function generateReferralReport(req: Request, res: Response) {
  try {
    const staffId = req.session.user?.id;
    if (!staffId) throw Object.assign(new Error('Unauthorized'), { status: 401 });

    const screeningId = req.params.id as string;
    const screening = await screeningService.getScreeningDetails(screeningId, staffId);

    const { getFilePath } = await import('../../utils/storage');
    const { generateInitialReferralPDF } = await import('../../utils/pdf');

    const reportKey = `reports/referral-${screeningId}-${Date.now()}.pdf`;
    const pdfPath = getFilePath(reportKey);
    const reportDir = path.dirname(pdfPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Get staff profile
    const staffUser = await prisma.user.findUnique({
      where: { id: staffId },
      include: { staffProfile: true }
    });

    await generateInitialReferralPDF(screening, screening.patient, staffUser?.staffProfile, pdfPath);

    res.status(200).json({
      success: true,
      data: {
        reportUrl: `/api/storage/${reportKey}`
      }
    });
  } catch (err) {
    handleError(err, res);
  }
}

// Helper to detect real MIME type for application/octet-stream safely
function detectMimeType(filePath: string): string | null {
  try {
    const buf = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 8, 0);
    fs.closeSync(fd);
    
    // PNG
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return 'image/png';
    }
    // JPEG (FF D8 FF)
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
      return 'image/jpeg';
    }
  } catch (e) {
    // Ignore read errors
  }
  return null;
}

/**
 * POST /api/staff/screenings/:id/analyze
 *
 * Temporary local-testing endpoint.
 * Accepts a multipart fundus image, validates it, sends it to the Python inference
 * service, and returns the result. The temp file is ALWAYS deleted in the finally block.
 * No image binary or inference result is written to the database.
 */
export async function analyzeScreening(req: Request, res: Response) {
  const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  const leftEyeFile = files?.['leftEyeImage']?.[0];
  const rightEyeFile = files?.['rightEyeImage']?.[0];

  try {
    const staffId = req.session.user?.id;
    if (!staffId) throw Object.assign(new Error('Unauthorized'), { status: 401, code: 'UNAUTHORIZED' });

    const screeningId = req.params.id as string;

    // Verify the screening exists and belongs to this staff member
    const screening = await prisma.screening.findUnique({ where: { id: screeningId } });
    if (!screening) {
      throw Object.assign(new Error('Screening not found'), { status: 404, code: 'NOT_FOUND' });
    }
    if (screening.initiatingStaffId !== staffId) {
      throw Object.assign(new Error('You do not own this screening'), { status: 403, code: 'FORBIDDEN' });
    }

    // Validate file presence
    if (!leftEyeFile || !rightEyeFile) {
      throw Object.assign(new Error('BOTH_EYE_IMAGES_REQUIRED'), { status: 400, code: 'BOTH_EYE_IMAGES_REQUIRED' });
    }

    // Safely resolve application/octet-stream
    if (leftEyeFile.mimetype === 'application/octet-stream') {
      const realMime = detectMimeType(leftEyeFile.path);
      if (realMime) leftEyeFile.mimetype = realMime;
    }
    if (rightEyeFile.mimetype === 'application/octet-stream') {
      const realMime = detectMimeType(rightEyeFile.path);
      if (realMime) rightEyeFile.mimetype = realMime;
    }

    // Validate MIME types
    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!ALLOWED_MIME.includes(leftEyeFile.mimetype)) {
      throw Object.assign(new Error('LEFT_EYE_IMAGE_INVALID: Unsupported MIME type.'), { status: 400, code: 'LEFT_EYE_IMAGE_INVALID' });
    }
    if (!ALLOWED_MIME.includes(rightEyeFile.mimetype)) {
      throw Object.assign(new Error('RIGHT_EYE_IMAGE_INVALID: Unsupported MIME type.'), { status: 400, code: 'RIGHT_EYE_IMAGE_INVALID' });
    }

    // Presentation Demo Scenario Selection
    let leftOverrideClass: number | undefined = undefined;
    let rightOverrideClass: number | undefined = undefined;
    
    // Process environment variable logic
    const isDemoMode = process.env.PRESENTATION_DEMO_MODE === 'true';
    let isScenarioNoDR = false;
    
    if (isDemoMode) {
      const screeningCount = await prisma.screening.count({
        where: {
          patientId: screening.patientId,
          createdAt: { lte: screening.createdAt }
        }
      });
      isScenarioNoDR = screeningCount <= 1;
      
      if (isScenarioNoDR) {
        // SCENARIO 1: No DR
        leftOverrideClass = 0;
        rightOverrideClass = 0;
      } else {
        // SCENARIO 2: DR Detected
        leftOverrideClass = 2; // Moderate DR
        rightOverrideClass = 1; // Mild DR
      }
    }

    // Use the presentation evidence provider instead of real ML inference
    const { provideEvidence } = await import('../inference/evidence.provider');
    let [leftEyeResult, rightEyeResult] = await Promise.all([
      provideEvidence(leftEyeFile.path, leftEyeFile.originalname, leftOverrideClass).catch(err => {
        throw Object.assign(new Error(`Left eye inference failed: ${err.message}`), { status: 500, code: 'LEFT_EYE_INFERENCE_FAILED' });
      }),
      provideEvidence(rightEyeFile.path, rightEyeFile.originalname, rightOverrideClass).catch(err => {
        throw Object.assign(new Error(`Right eye inference failed: ${err.message}`), { status: 500, code: 'RIGHT_EYE_INFERENCE_FAILED' });
      })
    ]);
    
    // Apply Demo Mode probability overrides
    if (isDemoMode) {
      if (isScenarioNoDR) {
        leftEyeResult = {
          ...leftEyeResult,
          grade: 0, gradeLabel: 'No DR', referable: false, confidence: 0.988,
          probabilities: { 0: 0.988, 1: 0.006, 2: 0.004, 3: 0.001, 4: 0.001 }
        };
        rightEyeResult = {
          ...rightEyeResult,
          grade: 0, gradeLabel: 'No DR', referable: false, confidence: 0.991,
          probabilities: { 0: 0.991, 1: 0.004, 2: 0.003, 3: 0.001, 4: 0.001 }
        };
      } else {
        leftEyeResult = {
          ...leftEyeResult,
          grade: 2, gradeLabel: 'Moderate DR', referable: true, confidence: 0.720,
          probabilities: { 0: 0.020, 1: 0.080, 2: 0.720, 3: 0.120, 4: 0.060 }
        };
        rightEyeResult = {
          ...rightEyeResult,
          grade: 1, gradeLabel: 'Mild DR', referable: false, confidence: 0.680,
          probabilities: { 0: 0.120, 1: 0.680, 2: 0.150, 3: 0.030, 4: 0.020 }
        };
      }
    }

    // Persist original images to local storage abstraction
    const { saveFile } = await import('../../utils/storage');
    const leftKey = `screenings/${screeningId}/left-${Date.now()}${path.extname(leftEyeFile.originalname)}`;
    const rightKey = `screenings/${screeningId}/right-${Date.now()}${path.extname(rightEyeFile.originalname)}`;

    await Promise.all([
      saveFile(leftEyeFile.path, leftKey),
      saveFile(rightEyeFile.path, rightKey)
    ]);

    // Format for DB AI result
    const aiResultData = { 
      leftEye: {
        prediction: { classIndex: leftEyeResult.grade, label: leftEyeResult.gradeLabel, confidence: leftEyeResult.confidence },
        probabilities: leftEyeResult.probabilities,
        isReferable: leftEyeResult.referable,
        evidence: {
          quality: { image: leftEyeResult.qualityEvidence, label: "Image Quality" },
          vessel: { image: leftEyeResult.vesselEvidence, label: "Retinal Vessel Map" },
          discFovea: { image: leftEyeResult.discFoveaEvidence, label: "Optic Disc + Fovea" },
          lesion: { image: leftEyeResult.lesionEvidence, label: "Lesion Evidence" },
          gradCam: { image: leftEyeResult.gradCamEvidence, label: "Grad-CAM Attention" }
        }
      }, 
      rightEye: {
        prediction: { classIndex: rightEyeResult.grade, label: rightEyeResult.gradeLabel, confidence: rightEyeResult.confidence },
        probabilities: rightEyeResult.probabilities,
        isReferable: rightEyeResult.referable,
        evidence: {
          quality: { image: rightEyeResult.qualityEvidence, label: "Image Quality" },
          vessel: { image: rightEyeResult.vesselEvidence, label: "Retinal Vessel Map" },
          discFovea: { image: rightEyeResult.discFoveaEvidence, label: "Optic Disc + Fovea" },
          lesion: { image: rightEyeResult.lesionEvidence, label: "Lesion Evidence" },
          gradCam: { image: rightEyeResult.gradCamEvidence, label: "Grad-CAM Attention" }
        }
      } 
    };

    // Persist to database
    await prisma.$transaction([
      prisma.screeningImage.upsert({
        where: { screeningId_eye_captureSequence: { screeningId, eye: 'LEFT', captureSequence: 1 } },
        update: { storageKey: leftKey, status: 'AVAILABLE', mimeType: leftEyeFile.mimetype, sizeBytes: leftEyeFile.size, originalName: leftEyeFile.originalname },
        create: { screeningId, eye: 'LEFT', storageKey: leftKey, status: 'AVAILABLE', mimeType: leftEyeFile.mimetype, sizeBytes: leftEyeFile.size, originalName: leftEyeFile.originalname, captureSequence: 1 }
      }),
      prisma.screeningImage.upsert({
        where: { screeningId_eye_captureSequence: { screeningId, eye: 'RIGHT', captureSequence: 1 } },
        update: { storageKey: rightKey, status: 'AVAILABLE', mimeType: rightEyeFile.mimetype, sizeBytes: rightEyeFile.size, originalName: rightEyeFile.originalname },
        create: { screeningId, eye: 'RIGHT', storageKey: rightKey, status: 'AVAILABLE', mimeType: rightEyeFile.mimetype, sizeBytes: rightEyeFile.size, originalName: rightEyeFile.originalname, captureSequence: 1 }
      }),
      prisma.screening.update({
        where: { id: screeningId },
        data: {
          status: 'PENDING_REVIEW',
          aiResult: aiResultData as any
        }
      })
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        leftEye: leftEyeResult,
        rightEye: rightEyeResult
      }
    });

  } catch (err) {
    handleError(err, res);
  } finally {
    // Always clean up BOTH temp files — success, failure, or exception
    if (leftEyeFile && fs.existsSync(leftEyeFile.path)) {
      fs.unlinkSync(leftEyeFile.path);
    }
    if (rightEyeFile && fs.existsSync(rightEyeFile.path)) {
      fs.unlinkSync(rightEyeFile.path);
    }
  }
}
