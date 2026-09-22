import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { REFERRAL_HOSPITAL } from '../config/hospital';

export async function generateClinicalReportPDF(
  screening: any,
  patient: any,
  doctor: any,
  review: any,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      /** Safely format any date value (Date object or ISO string) */
      const fmt = (d: unknown): string => {
        if (!d) return 'N/A';
        try {
          return new Date(d as string | Date).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
          });
        } catch {
          return String(d);
        }
      };

      /** Strip leading "Dr." prefix to avoid duplication */
      const stripDr = (name: string): string =>
        (name || '').replace(/^Dr\.?\s*/i, '').trim();

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // --- Header ---
      doc.fontSize(20).text('VISION AI', { align: 'center' });
      doc.fontSize(14).text('Diabetic Retinopathy Screening Report', { align: 'center' });
      doc.moveDown(2);

      // --- Patient Information ---
      doc.fontSize(16).text('PATIENT INFORMATION');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      const maskedAadhaar = patient.aadhaarReference
        ? ('XXXX XXXX ' + String(patient.aadhaarReference).replace(/\s/g, '').slice(-4))
        : 'Not on record';

      doc.fontSize(12);
      doc.text(`Patient Name: ${[patient.firstName, patient.lastName].filter(Boolean).join(' ')}`);
      doc.text(`Patient ID: ${patient.id}`);
      doc.text(`Age: ${patient.age ?? 'N/A'}`);
      doc.text(`Gender: ${patient.gender ?? 'N/A'}`);
      doc.text(`Aadhaar Reference: ${maskedAadhaar}`);
      doc.text(`Facility: ${doctor?.facility?.name ?? 'Unassigned'}`);
      doc.text(`Screening ID: ${screening.id}`);
      doc.text(`Screening Date: ${fmt(screening.createdAt)}`);
      doc.moveDown(2);

      const aiResult = screening.aiResult;

      if (aiResult) {
        // --- AI Screening Results ---
        doc.fontSize(16).text('AI SCREENING RESULTS');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        const renderEyeResult = (title: string, eyeRes: any, eyeLabel: string) => {
          doc.fontSize(14).text(title);
          if (!eyeRes || !eyeRes.prediction) {
            doc.fontSize(12).text('No data available.');
            doc.moveDown();
            return;
          }
          doc.fontSize(12);
          doc.text(`AI Prediction: ${eyeRes.prediction.label ?? 'N/A'}`);
          doc.text(`AI Confidence: ${eyeRes.prediction.confidence != null ? (eyeRes.prediction.confidence * 100).toFixed(2) + '%' : 'N/A'}`);
          doc.text(`Referable Status: ${eyeRes.isReferable ? 'Referable' : 'Non-referable'}`);
          doc.moveDown(0.5);

          if (Array.isArray(eyeRes.probabilities) && eyeRes.probabilities.length > 0) {
            doc.text('Class Probabilities:');
            const classes = ['No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR'];
            eyeRes.probabilities.forEach((prob: number, i: number) => {
              const pct = typeof prob === 'number' ? (prob * 100).toFixed(2) + '%' : 'N/A';
              doc.text(`  - ${classes[i] ?? `Class ${i}`}: ${pct}`);
            });
          }
          doc.moveDown(0.5);

          // Find the original image for this eye
          if (screening.images) {
             const imgRecord = screening.images.find((img: any) => img.eye === eyeLabel);
             if (imgRecord && imgRecord.storageKey) {
                try {
                  const { getFilePath } = require('./storage');
                  const fs = require('fs');
                  const imgPath = getFilePath(imgRecord.storageKey);
                  if (fs.existsSync(imgPath)) {
                    doc.image(imgPath, { fit: [200, 200] });
                    doc.moveDown(0.5);
                  } else {
                    doc.text('(Image file not found on disk)');
                  }
                } catch(e) {
                  doc.text('(Error loading image)');
                }
             }
          }
          doc.moveDown(1);
        };

        renderEyeResult('LEFT EYE (OS — Oculus Sinister)', aiResult.leftEye, 'LEFT');
        renderEyeResult('RIGHT EYE (OD — Oculus Dexter)', aiResult.rightEye, 'RIGHT');
      }

      // --- Clinical Review ---
      doc.fontSize(16).text('CLINICAL REVIEW');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(12);
      doc.text(`Reviewed By: Dr. ${stripDr(doctor?.professionalName ?? 'Unknown')}`);
      doc.text(`Reviewed At: ${fmt(review.reviewedAt)}`);
      doc.moveDown(0.5);

      const assessmentStr = review.doctorDecision === 'DR_DETECTED' ? 'DR Detected' : 'No DR Detected';
      doc.text(`Clinical Assessment: ${assessmentStr}`);
      doc.moveDown(0.5);
      doc.text('Remarks/Notes:');
      doc.text(review.clinicalNotes || 'No notes provided.');
      doc.moveDown(0.5);
      doc.text('Recommendation:');
      doc.text(review.recommendation || 'None');
      doc.moveDown(0.5);
      doc.text('Follow-up Instructions:');
      doc.text(review.followUp || 'None');
      doc.moveDown(2);

      // --- Hospital Info ---
      doc.fontSize(16).text('HOSPITAL DETAILS');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Name: ${REFERRAL_HOSPITAL.hospitalName}`);
      doc.text(`Address: ${REFERRAL_HOSPITAL.address}, ${REFERRAL_HOSPITAL.district}, ${REFERRAL_HOSPITAL.state}`);
      doc.text(`Phone: ${REFERRAL_HOSPITAL.phone} | ${REFERRAL_HOSPITAL.contact}`);
      doc.moveDown(2);

      // --- Explainability ---
      doc.fontSize(16).text('MODEL ATTENTION (EXPLAINABILITY)');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(10).text('Grad-CAM highlights regions that influenced the AI prediction. It is a model-attention visualization and is not a segmentation map of lesions.');
      doc.moveDown(1);

      // Attach Grad-CAM images if available
      if (aiResult) {
        const renderGradCam = (eyeRes: any, label: string) => {
          if (eyeRes && eyeRes.gradCam) {
            try {
              const base64Data = eyeRes.gradCam.replace(/^data:image\/\w+;base64,/, "");
              const buffer = Buffer.from(base64Data, 'base64');
              doc.fontSize(12).text(label);
              // Image max width 200 to fit on page
              doc.image(buffer, { fit: [200, 200] });
              doc.moveDown(1);
            } catch (e) {
              doc.text(`(Could not render Grad-CAM for ${label})`);
            }
          }
        };

        renderGradCam(aiResult.leftEye, 'Left Eye Grad-CAM');
        renderGradCam(aiResult.rightEye, 'Right Eye Grad-CAM');
      }

      doc.moveDown(2);

      // --- Disclaimer ---
      doc.fontSize(10).text('DISCLAIMER: AI screening results are intended to support clinical review and do not replace professional medical judgment.', { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}
export async function generateInitialReferralPDF(
  screening: any,
  patient: any,
  staff: any,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const fmt = (d: unknown): string => {
        if (!d) return 'N/A';
        try {
          return new Date(d as string | Date).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
          });
        } catch { return String(d); }
      };

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // --- Header ---
      doc.fontSize(20).text('VISION AI', { align: 'center' });
      doc.fontSize(14).text('Initial DR Screening & Referral Report', { align: 'center' });
      doc.moveDown(2);

      // --- Patient Information ---
      doc.fontSize(14).text('PATIENT INFORMATION');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      const maskedAadhaar = patient.aadhaarReference
        ? ('XXXX XXXX ' + String(patient.aadhaarReference).replace(/\s/g, '').slice(-4))
        : 'Not on record';

      doc.fontSize(10);
      doc.text(`Patient Name: ${[patient.firstName, patient.lastName].filter(Boolean).join(' ')}`);
      doc.text(`Patient ID: ${patient.id}`);
      doc.text(`Age: ${patient.age ?? 'N/A'}`);
      doc.text(`Gender: ${patient.gender ?? 'N/A'}`);
      doc.text(`Aadhaar: ${maskedAadhaar}`);
      doc.text(`Screened By: ${staff?.professionalName ?? 'Unknown Staff'}`);
      doc.text(`Screening ID: ${screening.id}`);
      doc.text(`Screening Date: ${fmt(screening.createdAt)}`);
      doc.moveDown(2);

      // --- Hospital Referral Info ---
      doc.fontSize(14).text('REFERRAL HOSPITAL DETAILS');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      doc.fontSize(10);
      doc.text(`Name: ${REFERRAL_HOSPITAL.hospitalName}`);
      doc.text(`Address: ${REFERRAL_HOSPITAL.address}, ${REFERRAL_HOSPITAL.district}, ${REFERRAL_HOSPITAL.state}`);
      doc.text(`Phone: ${REFERRAL_HOSPITAL.phone} | ${REFERRAL_HOSPITAL.contact}`);
      doc.moveDown(2);

      // --- Initial Findings ---
      doc.fontSize(14).text('INITIAL FINDINGS');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      const aiResult = screening.aiResult;
      if (aiResult) {
        const renderEyeResult = (title: string, eyeRes: any, eyeLabel: string) => {
          doc.fontSize(12).text(title);
          if (!eyeRes || !eyeRes.prediction) {
            doc.fontSize(10).text('No data available.');
            doc.moveDown();
            return;
          }
          doc.fontSize(10);
          doc.text(`AI Prediction: ${eyeRes.prediction.label ?? 'N/A'}`);
          doc.text(`Referable Status: ${eyeRes.isReferable ? 'Referable - Ophthalmologist Review Required' : 'Non-referable'}`);
          doc.moveDown(0.5);

          // Find the original image for this eye
          if (screening.images) {
             const imgRecord = screening.images.find((img: any) => img.eye === eyeLabel);
             if (imgRecord && imgRecord.storageKey) {
                try {
                  const { getFilePath } = require('./storage');
                  const fs = require('fs');
                  const imgPath = getFilePath(imgRecord.storageKey);
                  if (fs.existsSync(imgPath)) {
                    doc.image(imgPath, { fit: [200, 200] });
                    doc.moveDown(0.5);
                  } else {
                    doc.text('(Image file not found on disk)');
                  }
                } catch(e) {
                  doc.text('(Error loading image)');
                }
             }
          }
          
          doc.moveDown(1);
        };
        renderEyeResult('LEFT EYE (OS)', aiResult.leftEye, 'LEFT');
        renderEyeResult('RIGHT EYE (OD)', aiResult.rightEye, 'RIGHT');
      }

      doc.moveDown(2);
      doc.fontSize(10).fillColor('red').text('DISCLAIMER: This is an initial screening report generated by AI. It is NOT a clinical diagnosis. Please present this report to the referral hospital for a complete clinical review by an ophthalmologist.', { align: 'center' });
      doc.fillColor('black');

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}
