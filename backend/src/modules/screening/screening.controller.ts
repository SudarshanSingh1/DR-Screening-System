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
  // Persistent result storage is not implemented in Phase 3C
  res.status(501).json({
    success: false,
    code: 'PERSISTENT_RESULT_NOT_AVAILABLE',
    error: 'Persistent inference results are not stored in this phase. Results are returned directly from /analyze.'
  });
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

    // Call inference service independently and concurrently
    const [leftEyeResult, rightEyeResult] = await Promise.all([
      analyzeImage(leftEyeFile.path, leftEyeFile.originalname, leftEyeFile.mimetype).catch(err => {
        throw Object.assign(new Error(`Left eye inference failed: ${err.message}`), { status: 500, code: 'LEFT_EYE_INFERENCE_FAILED' });
      }),
      analyzeImage(rightEyeFile.path, rightEyeFile.originalname, rightEyeFile.mimetype).catch(err => {
        throw Object.assign(new Error(`Right eye inference failed: ${err.message}`), { status: 500, code: 'RIGHT_EYE_INFERENCE_FAILED' });
      })
    ]);

    // Persist original images to local storage abstraction
    const { saveFile } = await import('../../utils/storage');
    const leftKey = `screenings/${screeningId}/left-${Date.now()}${path.extname(leftEyeFile.originalname)}`;
    const rightKey = `screenings/${screeningId}/right-${Date.now()}${path.extname(rightEyeFile.originalname)}`;

    await Promise.all([
      saveFile(leftEyeFile.path, leftKey),
      saveFile(rightEyeFile.path, rightKey)
    ]);

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
          aiResult: { leftEye: leftEyeResult, rightEye: rightEyeResult }
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
