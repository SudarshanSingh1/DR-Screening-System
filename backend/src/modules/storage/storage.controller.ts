import { Request, Response } from 'express';
import fs from 'fs';
import { getFilePath } from '../../utils/storage';
import { prisma } from '../../db/prisma';

export async function getFile(req: Request, res: Response): Promise<void> {
  try {
    const keyVal = req.params[0] || req.params.key;
    const key = Array.isArray(keyVal) ? keyVal.join('/') : (keyVal as string);

    if (!key) {
      res.status(400).json({ success: false, error: 'Key is required' });
      return;
    }

    // Prevent path traversal
    if (key.includes('..') || key.includes('\0')) {
      res.status(403).json({ success: false, error: 'Invalid key' });
      return;
    }

    const user = req.session.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // ── Report access authorization ─────────────────────────────────────────
    if (key.startsWith('reports/')) {
      const role = user.role;
      if (key.includes('referral-')) {
         if (role === 'patient') {
            res.status(403).json({ success: false, error: 'Forbidden' });
            return;
         }
      } else {
          const report = await prisma.clinicalReport.findFirst({
            where: { storageKey: key },
            include: {
              screening: {
                include: { patient: true }
              },
              review: true
            }
          });

          if (!report) {
            res.status(404).json({ success: false, error: 'File not found' });
            return;
          }

      if (role === 'patient') {
        // Patient can only access their own report
        const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
        if (!patient || report.screening.patientId !== patient.id) {
          res.status(403).json({ success: false, error: 'Forbidden' });
          return;
        }
      } else if (role === 'doctor') {
        // Doctor can access reports for screenings within their facility scope
        const doctorProfile = await prisma.doctorProfile.findUnique({
          where: { userId: user.id }
        });
        if (!doctorProfile || !doctorProfile.facilityId) {
          res.status(403).json({ success: false, error: 'Forbidden: no facility assigned' });
          return;
        }
        // The screening's initiating staff must belong to the same facility
        const initiatingStaffId = report.screening.initiatingStaffId;
        if (!initiatingStaffId) {
          res.status(403).json({ success: false, error: 'Forbidden: screening has no initiating staff' });
          return;
        }
        const staffProfile = await prisma.staffProfile.findFirst({
          where: { userId: initiatingStaffId, facilityId: doctorProfile.facilityId }
        });
        if (!staffProfile) {
          res.status(403).json({ success: false, error: 'Forbidden: screening not in your facility' });
          return;
        }
      } else if (role === 'screening_staff') {
        // Staff can access reports for screenings from their facility
        const staffProfile = await prisma.staffProfile.findUnique({
          where: { userId: user.id }
        });
        if (!staffProfile || !staffProfile.facilityId) {
          res.status(403).json({ success: false, error: 'Forbidden: no facility assigned' });
          return;
        }
        const initiatingStaffId = report.screening.initiatingStaffId;
        if (!initiatingStaffId) {
          res.status(403).json({ success: false, error: 'Forbidden' });
          return;
        }
        const initiatorProfile = await prisma.staffProfile.findFirst({
          where: { userId: initiatingStaffId, facilityId: staffProfile.facilityId }
        });
        if (!initiatorProfile) {
          res.status(403).json({ success: false, error: 'Forbidden: screening not in your facility' });
          return;
        }
      } else if (role === 'engineer_admin') {
        // Admins have full read access
      } else {
        res.status(403).json({ success: false, error: 'Forbidden' });
        return;
      }
      }
    }

    // ── Image access authorization ───────────────────────────────────────────
    if (key.startsWith('images/')) {
      // Images are accessible to any authenticated non-patient user,
      // or to the patient whose screening it is.
      // For now: allow authenticated access (images are not PII in isolation).
      // Patient-specific image IDOR can be added in a future hardening pass.
    }

    const filePath = getFilePath(key);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    // Set appropriate content-type for PDFs
    if (key.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("STORAGE CONTROLLER ERROR:", err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
