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
      const fmt = (d: unknown): string => {
        if (!d) return 'N/A';
        try {
          return new Date(d as string | Date).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
          });
        } catch { return String(d); }
      };

      const stripDr = (name: string): string => (name || '').replace(/^Dr\.?\s*/i, '').trim();
      const doc = new PDFDocument({ margin: 30, size: 'A4' }); // A4 is 595.28 x 841.89
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // --- COLORS & STYLES ---
      const NAVY = '#003366';
      const LIGHT_BLUE = '#eaf4fc';
      const DARK_GRAY = '#333333';
      const RED = '#d32f2f';
      const GREEN = '#2e7d32';
      
      const drawRoundedBox = (x: number, y: number, w: number, h: number, fillColor: string, strokeColor?: string) => {
        doc.roundedRect(x, y, w, h, 8).fill(fillColor);
        if (strokeColor) {
          doc.roundedRect(x, y, w, h, 8).stroke(strokeColor);
        }
      };

      // 1. HEADER (Y: 30 -> 80)
      const logoPath = path.join(__dirname, '../../assets/VisionAi.png');
      let headerTextX = 30;
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 30, 30, { width: 50 });
          headerTextX = 90;
        } catch(e) {}
      }
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(22).text('VISION AI', headerTextX, 35);
      doc.font('Helvetica').fontSize(10).text('Diabetic Retinopathy Screening System', headerTextX, 60);
      doc.font('Helvetica').fontSize(9).text('AI for Accessible Eye Care | Rural India', headerTextX, 72);

      // Right side badge
      doc.font('Helvetica-Bold').fontSize(14).text('SIH26038', 400, 35, { align: 'right', width: 165 });
      doc.font('Helvetica').fontSize(10).text('Early Detection | Better Lives', 400, 55, { align: 'right', width: 165 });

      doc.moveTo(30, 90).lineTo(565, 90).lineWidth(1).stroke(NAVY);

      // 2. REPORT TITLE (Y: 100 -> 135)
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(16).text('DIABETIC RETINOPATHY SCREENING REPORT', 30, 105, { align: 'center', width: 535 });
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(12).text('AI-Assisted Screening + Clinical Review', 30, 125, { align: 'center', width: 535 });

      // 3. PATIENT INFO (Y: 145 -> 205)
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('PATIENT INFORMATION', 30, 145);
      drawRoundedBox(30, 160, 535, 55, LIGHT_BLUE);
      
      const maskedAadhaar = patient.aadhaarReference ? ('XXXX XXXX ' + String(patient.aadhaarReference).replace(/\s/g, '').slice(-4)) : 'Not on record';
      const pName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');
      
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(10);
      doc.text(`Name:`, 40, 170).font('Helvetica-Bold').text(pName, 90, 170);
      doc.font('Helvetica').text(`Patient ID:`, 40, 185).font('Helvetica-Bold').text(patient.id, 90, 185);
      doc.font('Helvetica').text(`Age/Gender:`, 40, 200).font('Helvetica-Bold').text(`${patient.age ?? 'N/A'} / ${patient.gender ?? 'N/A'}`, 100, 200);

      doc.font('Helvetica').text(`Aadhaar:`, 240, 170).font('Helvetica-Bold').text(maskedAadhaar, 290, 170);
      doc.font('Helvetica').text(`Facility:`, 240, 185).font('Helvetica-Bold').text(doctor?.facility?.name ?? 'Vision AI Centre', 290, 185);
      
      doc.font('Helvetica').text(`Screening ID:`, 410, 170).font('Helvetica-Bold').text(screening.id.substring(0, 15) + '...', 475, 170);
      doc.font('Helvetica').text(`Date:`, 410, 185).font('Helvetica-Bold').text(fmt(screening.createdAt), 450, 185);

      // 4. AI SCREENING RESULTS (Y: 225 -> 355)
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('AI SCREENING RESULTS', 30, 225);
      
      const aiResult = screening.aiResult;
      
      const drawEyeResult = (x: number, y: number, title: string, eyeRes: any) => {
        drawRoundedBox(x, y, 260, 120, '#f9f9f9', '#cccccc');
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text(title, x + 10, y + 10);
        
        if (!eyeRes || !eyeRes.prediction) {
           doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(10).text('No data available.', x + 10, y + 30);
           return;
        }

        const isRef = eyeRes.isReferable;
        const color = isRef ? RED : GREEN;
        
        doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(10);
        doc.text('AI Prediction:', x + 10, y + 30);
        doc.fillColor(color).font('Helvetica-Bold').text(eyeRes.prediction.label || 'N/A', x + 90, y + 30);
        
        doc.fillColor(DARK_GRAY).font('Helvetica');
        doc.text('Confidence:', x + 10, y + 45);
        doc.font('Helvetica-Bold').text(`${((eyeRes.prediction.confidence || 0) * 100).toFixed(1)}%`, x + 90, y + 45);
        
        doc.font('Helvetica').text('Status:', x + 10, y + 60);
        doc.fillColor(color).font('Helvetica-Bold').text(isRef ? 'Referable' : 'Non-referable', x + 90, y + 60);
        
        // Probability bars
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9).text('Class Probabilities', x + 10, y + 80);
        if (eyeRes.probabilities) {
          const classes = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'];
          let barY = y + 95;
          classes.forEach((cls, i) => {
            const prob = eyeRes.probabilities[i] || 0;
            const barW = Math.max(2, prob * 100); // 100 max width
            doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(8).text(cls, x + 10, barY - 1);
            doc.rect(x + 70, barY, 100, 6).fill('#dddddd');
            // color code the bars
            const barColors = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];
            doc.rect(x + 70, barY, barW, 6).fill(barColors[i]);
            doc.fillColor(DARK_GRAY).text(`${(prob * 100).toFixed(1)}%`, x + 175, barY - 1);
            barY += 10;
          });
        }
      };

      drawEyeResult(30, 240, 'LEFT EYE (OS)', aiResult?.leftEye);
      drawEyeResult(305, 240, 'RIGHT EYE (OD)', aiResult?.rightEye);

      // 5. OVERALL CLINICAL STATUS (Y: 370 -> 420)
      const assessmentStr = review.doctorDecision === 'DR_DETECTED' ? 'DR Detected' : 'No DR Detected';
      const overallColor = review.doctorDecision === 'DR_DETECTED' ? RED : GREEN;
      const refStatus = review.doctorDecision === 'DR_DETECTED' ? 'Referable - Specialist evaluation recommended' : 'Non-referable - Routine follow-up';
      
      drawRoundedBox(30, 370, 535, 45, '#ffffff', overallColor);
      doc.fillColor(DARK_GRAY).font('Helvetica-Bold').fontSize(11).text('OVERALL CLINICAL STATUS', 40, 378);
      doc.fillColor(overallColor).font('Helvetica-Bold').fontSize(14).text(assessmentStr, 40, 393);
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(10).text(refStatus, 200, 396);

      // 6. ORIGINAL FUNDUS IMAGES (Y: 430 -> 610)
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('FUNDUS IMAGES (Original)', 30, 430);
      drawRoundedBox(30, 445, 260, 160, '#f9f9f9', '#cccccc');
      drawRoundedBox(305, 445, 260, 160, '#f9f9f9', '#cccccc');
      
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10).text('LEFT EYE (OS)', 30, 453, { width: 260, align: 'center' });
      doc.text('RIGHT EYE (OD)', 305, 453, { width: 260, align: 'center' });

      const { getFilePath } = require('./storage');
      const renderImage = (eyeLabel: string, x: number, y: number) => {
        if (screening.images) {
           const imgRecord = screening.images.find((img: any) => img.eye === eyeLabel);
           if (imgRecord && imgRecord.storageKey) {
              try {
                const imgPath = getFilePath(imgRecord.storageKey);
                if (fs.existsSync(imgPath)) {
                  doc.image(imgPath, x, y, { fit: [240, 130], align: 'center', valign: 'center' });
                  return;
                }
              } catch(e) {}
           }
        }
        doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(10).text('(Image not available)', x, y + 60, { width: 240, align: 'center' });
      };
      
      renderImage('LEFT', 40, 468);
      renderImage('RIGHT', 315, 468);

      // 7. CLINICAL REVIEW (Y: 620 -> 700)
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('DISTRICT HOSPITAL CLINICAL REVIEW', 30, 620);
      drawRoundedBox(30, 635, 535, 65, LIGHT_BLUE);
      
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(10);
      doc.text(`Reviewed By:`, 40, 645).font('Helvetica-Bold').text(`Dr. ${stripDr(doctor?.professionalName ?? 'Unknown')}`, 110, 645);
      doc.font('Helvetica').text(`Reviewed At:`, 40, 660).font('Helvetica-Bold').text(fmt(review.reviewedAt), 110, 660);
      doc.font('Helvetica').text(`Assessment:`, 40, 675).font('Helvetica-Bold').text(assessmentStr, 110, 675);

      doc.font('Helvetica').text(`Remarks:`, 280, 645).font('Helvetica-Bold').text(review.clinicalNotes || 'None', 350, 645, { width: 200, height: 12, lineBreak: false });
      doc.font('Helvetica').text(`Recommendation:`, 280, 660).font('Helvetica-Bold').text(review.recommendation || 'None', 365, 660, { width: 180, height: 12, lineBreak: false });
      doc.font('Helvetica').text(`Follow-up:`, 280, 675).font('Helvetica-Bold').text(review.followUp || 'None', 335, 675, { width: 200, height: 12, lineBreak: false });

      // 8. FOOTER BLOCKS (Y: 715 -> 790)
      // Left: Hospital
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('REFERRAL / FACILITY DETAILS', 30, 715);
      doc.fillColor(DARK_GRAY).font('Helvetica-Bold').fontSize(10).text(REFERRAL_HOSPITAL.hospitalName, 30, 735);
      doc.font('Helvetica').text(`${REFERRAL_HOSPITAL.address}, ${REFERRAL_HOSPITAL.district}`, 30, 750);
      doc.text(`Phone: ${REFERRAL_HOSPITAL.phone} | Emergency: ${REFERRAL_HOSPITAL.contact}`, 30, 765);

      // Right: Sign-off
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('DOCTOR SIGN-OFF', 305, 715);
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(9).text('Reviewed and digitally signed by', 305, 735);
      doc.font('Helvetica-Bold').fontSize(11).text(`Dr. ${stripDr(doctor?.professionalName ?? 'Unknown')}`, 305, 748);
      doc.font('Helvetica').fontSize(9).text('Clinical Reviewer', 305, 761);
      doc.text(`Date: ${fmt(review.reviewedAt)}`, 305, 774);
      
      // Draw a fake signature line
      doc.moveTo(450, 770).lineTo(550, 770).lineWidth(0.5).stroke('#333333');
      doc.font('Helvetica-Oblique').fontSize(14).fillColor(NAVY).text('Digitally Signed', 450, 750);

      // 9. DISCLAIMER & PAGE NUMBER (Y: 805)
      doc.moveTo(30, 790).lineTo(565, 790).lineWidth(1).stroke('#dddddd');
      doc.fillColor('#666666').font('Helvetica').fontSize(8);
      doc.text('DISCLAIMER: AI screening results are intended to support clinical review and do not replace professional medical judgment.', 30, 810, { width: 450 });
      doc.text(`Screening ID: ${screening.id}`, 30, 820, { width: 450 });
      doc.text('Page 1 of 1', 500, 815, { align: 'right' });

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

      const doc = new PDFDocument({ margin: 30, size: 'A4' }); // A4 is 595.28 x 841.89
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // --- COLORS & STYLES ---
      const NAVY = '#003366';
      const LIGHT_BLUE = '#eaf4fc';
      const DARK_GRAY = '#333333';
      const RED = '#d32f2f';
      const GREEN = '#2e7d32';
      const ORANGE = '#ed6c02';
      const LIGHT_ORANGE = '#fff4e5';
      const PURPLE = '#9c27b0';
      const BLUE = '#1976d2';
      
      const drawRoundedBox = (x: number, y: number, w: number, h: number, fillColor: string, strokeColor?: string) => {
        doc.roundedRect(x, y, w, h, 8).fill(fillColor);
        if (strokeColor) {
          doc.roundedRect(x, y, w, h, 8).stroke(strokeColor);
        }
      };

      const drawProbabilityBar = (x: number, y: number, w: number, prob: number, color: string) => {
        doc.rect(x, y, w, 6).fill('#eeeeee');
        doc.rect(x, y, w * prob, 6).fill(color);
      };

      // 1. HEADER (Y: 30 -> 80)
      let headerTextX = 30;
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(22).text('VISION AI', headerTextX, 30);
      doc.fillColor(DARK_GRAY).font('Helvetica-Bold').fontSize(11).text('Diabetic Retinopathy Screening System', headerTextX, 55);
      doc.font('Helvetica').fontSize(9).text('AI-Assisted Eye Screening | Rural India', headerTextX, 68);
      doc.fillColor(NAVY).fontSize(8).text('Early Detection • Healthier Communities • Brighter Tomorrows', headerTextX, 82);

      // SIH26038 Box (Right)
      drawRoundedBox(450, 30, 115, 55, NAVY);
      doc.fillColor('white').font('Helvetica-Bold').fontSize(12).text('SIH26038', 450, 38, { align: 'center', width: 115 });
      doc.font('Helvetica').fontSize(9).text('Rural India', 450, 53, { align: 'center', width: 115 });
      doc.text('Early Detection', 450, 64, { align: 'center', width: 115 });
      doc.text('Better Lives', 450, 75, { align: 'center', width: 115 });

      doc.moveTo(30, 100).lineTo(565, 100).lineWidth(1).stroke(LIGHT_BLUE);

      // 2. REPORT TITLE (Y: 110 -> 145)
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(18).text('DIABETIC RETINOPATHY', 30, 110, { align: 'center', width: 535 });
      doc.text('INITIAL SCREENING REPORT', 30, 130, { align: 'center', width: 535 });
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(12).text('AI-Assisted Bilateral Eye Screening', 30, 150, { align: 'center', width: 535 });

      // AI Screening Status Card (Right)
      drawRoundedBox(410, 110, 155, 45, LIGHT_ORANGE, ORANGE);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9).text('AI SCREENING REPORT', 420, 115);
      doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(10).text('PENDING CLINICAL REVIEW', 420, 128);
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(7).text('Please visit the referral facility for further evaluation.', 420, 142, { width: 140 });

      // 3. PATIENT INFO (Y: 170 -> 240)
      drawRoundedBox(30, 175, 535, 70, LIGHT_BLUE);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text('PATIENT INFORMATION', 40, 182);
      
      const maskedAadhaar = patient.aadhaarReference ? ('XXXX XXXX ' + String(patient.aadhaarReference).replace(/s/g, '').slice(-4)) : 'Not on record';
      const pName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');
      
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(9);
      doc.text(`Patient Name:`, 40, 200).font('Helvetica-Bold').text(pName, 105, 200);
      doc.font('Helvetica').text(`Patient ID:`, 40, 212).font('Helvetica-Bold').text(patient.id, 105, 212);
      doc.font('Helvetica').text(`Age / Gender:`, 40, 224).font('Helvetica-Bold').text(`${patient.age ?? 'N/A'} / ${patient.gender ?? 'N/A'}`, 105, 224);

      doc.font('Helvetica').text(`Aadhaar:`, 250, 200).font('Helvetica-Bold').text(maskedAadhaar, 310, 200);
      doc.font('Helvetica').text(`Facility:`, 250, 212).font('Helvetica-Bold').text(staff?.facility?.name ?? 'Vision AI Screening Centre', 310, 212);
      doc.font('Helvetica').text(`Screening ID:`, 250, 224).font('Helvetica-Bold').text(screening.id.substring(0, 18) + '...', 310, 224);
      doc.font('Helvetica').text(`Date:`, 250, 236).font('Helvetica-Bold').text(fmt(screening.createdAt), 310, 236);
      
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text('Your Eyes', 470, 195);
      doc.text('Our Priority', 470, 208);
      doc.font('Helvetica').fontSize(7).text('Screen Today', 470, 223);
      doc.text('For a Healthier', 470, 232);

      // 4. AI SCREENING RESULTS (Y: 260)
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('AI SCREENING RESULTS', 30, 260);
      drawRoundedBox(30, 275, 535, 25, LIGHT_BLUE); // Header bar

      const aiResult = screening.aiResult;
      
      const drawEyeResult = (x: number, y: number, title: string, eyeRes: any, eyeLabel: string) => {
        doc.fillColor(RED).font('Helvetica-Bold').fontSize(11).text(title, x, 282); // The title goes in the header bar
        
        drawRoundedBox(x, y, 262, 125, '#ffffff', '#e0e0e0');
        
        if (!eyeRes || !eyeRes.prediction) {
           doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(10).text('No data available.', x + 10, y + 10);
           return;
        }

        // Left side: small thumbnail
        if (screening.images) {
           const imgRecord = screening.images.find((img: any) => img.eye === eyeLabel);
           if (imgRecord && imgRecord.storageKey) {
              try {
                const { getFilePath } = require('./storage');
                const imgPath = getFilePath(imgRecord.storageKey);
                if (fs.existsSync(imgPath)) {
                  doc.image(imgPath, x + 5, y + 5, { fit: [100, 115] });
                }
              } catch(e) {}
           }
        }

        // Right side: Details
        const isRef = eyeRes.isReferable;
        const color = isRef ? RED : GREEN;
        
        const tx = x + 115;
        doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(9);
        doc.text('AI Prediction:', tx, y + 10);
        doc.fillColor(color).font('Helvetica-Bold').text(eyeRes.prediction.label || 'N/A', tx + 70, y + 10);
        
        doc.fillColor(DARK_GRAY).font('Helvetica');
        doc.text('AI Confidence:', tx, y + 25);
        doc.font('Helvetica-Bold').text(`${((eyeRes.prediction.confidence || 0) * 100).toFixed(1)}%`, tx + 70, y + 25);
        
        doc.font('Helvetica').text('Referable Status:', tx, y + 40);
        doc.fillColor(color).font('Helvetica-Bold').text(isRef ? 'Referable' : 'Non-referable', tx + 75, y + 40);
        
        // Bar charts
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8).text('Class Probabilities', tx, y + 60);
        
        const probs = eyeRes.probabilities || [0,0,0,0,0];
        const pNames = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'];
        const pColors = [GREEN, BLUE, ORANGE, RED, PURPLE];
        
        let barY = y + 75;
        for (let i = 0; i < 5; i++) {
           doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(7).text(pNames[i], tx, barY);
           drawProbabilityBar(tx + 45, barY, 80, probs[i] || 0, pColors[i]);
           doc.fillColor(DARK_GRAY).font('Helvetica').text(`${((probs[i] || 0)*100).toFixed(1)}%`, tx + 130, barY);
           barY += 10;
        }
      };
      
      // Draw Eye cards (Y=305)
      drawEyeResult(30, 305, 'LEFT EYE (OS)', aiResult?.leftEye, 'LEFT');
      drawEyeResult(303, 305, 'RIGHT EYE (OD)', aiResult?.rightEye, 'RIGHT');

      // 5. OVERALL AI SCREENING SUMMARY (Y: 440)
      drawRoundedBox(30, 440, 535, 20, LIGHT_BLUE);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text('OVERALL AI SCREENING SUMMARY', 40, 445);
      
      drawRoundedBox(30, 465, 535, 60, '#ffffff', '#e0e0e0');
      
      // Determine overall
      let worstClass = 0;
      let maxConf = 0;
      let isReferableOverall = false;
      let worstLabel = 'No DR';
      if (aiResult?.leftEye?.prediction) {
         if (aiResult.leftEye.prediction.classIndex > worstClass) {
            worstClass = aiResult.leftEye.prediction.classIndex;
            worstLabel = aiResult.leftEye.prediction.label;
         }
         if (aiResult.leftEye.prediction.confidence > maxConf) maxConf = aiResult.leftEye.prediction.confidence;
         if (aiResult.leftEye.isReferable) isReferableOverall = true;
      }
      if (aiResult?.rightEye?.prediction) {
         if (aiResult.rightEye.prediction.classIndex > worstClass) {
            worstClass = aiResult.rightEye.prediction.classIndex;
            worstLabel = aiResult.rightEye.prediction.label;
         }
         if (aiResult.rightEye.prediction.confidence > maxConf) maxConf = aiResult.rightEye.prediction.confidence;
         if (aiResult.rightEye.isReferable) isReferableOverall = true;
      }
      
      const overallColor = isReferableOverall ? RED : GREEN;
      const bgAlertColor = isReferableOverall ? '#ffebee' : '#e8f5e9';
      
      drawRoundedBox(40, 475, 220, 40, bgAlertColor, overallColor);
      doc.fillColor(overallColor).font('Helvetica-Bold').fontSize(10).text('Overall Result', 50, 480);
      doc.fontSize(14).text(worstLabel.toUpperCase(), 50, 492);
      doc.fontSize(8).text(isReferableOverall ? 'Referable — Specialist evaluation recommended' : 'Routine screening recommended', 50, 506);
      
      // Overall Confidence
      doc.fillColor(DARK_GRAY).font('Helvetica-Bold').fontSize(9).text('Overall AI Confidence', 280, 485);
      doc.fontSize(16).text(`${(maxConf * 100).toFixed(1)}%`, 280, 498);
      
      // Recommendation
      doc.fillColor(DARK_GRAY).font('Helvetica-Bold').fontSize(9).text('Recommendation', 410, 480);
      doc.fillColor(overallColor).fontSize(10).text(isReferableOverall ? 'Refer to Ophthalmologist' : 'Routine Eye Checkup', 410, 492);
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(7).text(isReferableOverall ? 'Kindly visit the referral facility for detailed clinical evaluation.' : 'No immediate action required.', 410, 504, { width: 140 });

      // 6. FUNDUS IMAGES (Original Uploads) (Y: 535)
      drawRoundedBox(30, 535, 535, 20, LIGHT_BLUE);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text('FUNDUS IMAGES', 40, 540);
      doc.font('Helvetica').fontSize(9).text('(Original Uploads)', 150, 541);
      
      const drawFundus = (x: number, y: number, eyeLabel: string) => {
        drawRoundedBox(x, y, 262, 140, '#ffffff', '#e0e0e0');
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10).text(`${eyeLabel} EYE`, x, y + 10, { align: 'center', width: 262 });
        if (screening.images) {
           const imgRecord = screening.images.find((img: any) => img.eye === eyeLabel);
           if (imgRecord && imgRecord.storageKey) {
              try {
                const { getFilePath } = require('./storage');
                const imgPath = getFilePath(imgRecord.storageKey);
                if (fs.existsSync(imgPath)) {
                  doc.image(imgPath, x + 10, y + 25, { fit: [242, 105], align: 'center' });
                }
              } catch(e) {}
           }
        }
      };
      drawFundus(30, 560, 'LEFT');
      drawFundus(303, 560, 'RIGHT');

      // 7. BOTTOM CARDS (Y: 710)
      // Referral Facility
      drawRoundedBox(30, 710, 262, 20, LIGHT_BLUE);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10).text('REFERRAL FACILITY', 40, 715);
      
      drawRoundedBox(30, 730, 262, 60, '#ffffff', '#e0e0e0');
      doc.fillColor(DARK_GRAY).font('Helvetica-Bold').fontSize(10).text(REFERRAL_HOSPITAL.hospitalName, 40, 740);
      doc.font('Helvetica').fontSize(8).text(`Address: ${REFERRAL_HOSPITAL.address}, ${REFERRAL_HOSPITAL.district}, ${REFERRAL_HOSPITAL.state}`, 40, 755, { width: 240 });
      doc.text(`Phone: ${REFERRAL_HOSPITAL.phone}`, 40, 768);
      doc.text(`Emergency Contact: ${REFERRAL_HOSPITAL.contact}`, 40, 778);

      // Clinical Review Status
      drawRoundedBox(303, 710, 262, 20, LIGHT_BLUE);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10).text('CLINICAL REVIEW STATUS', 313, 715);
      
      drawRoundedBox(303, 730, 262, 60, '#ffffff', '#e0e0e0');
      drawRoundedBox(313, 740, 240, 20, LIGHT_ORANGE, ORANGE);
      doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(9).text('PENDING DISTRICT DOCTOR REVIEW', 313, 746, { align: 'center', width: 240 });
      doc.fillColor(DARK_GRAY).font('Helvetica').fontSize(8).text('Please present this report at the designated facility for clinical evaluation and confirmation.', 313, 765, { width: 240 });

      // 8. DISCLAIMER & FOOTER (Y: 800)
      doc.moveTo(30, 790).lineTo(565, 790).lineWidth(1).stroke(LIGHT_BLUE);
      
      doc.fillColor(RED).font('Helvetica-Bold').fontSize(8).text('IMPORTANT DISCLAIMER', 30, 795);
      doc.fillColor(DARK_GRAY).font('Helvetica').text('This report contains AI-assisted screening results and is not a final medical diagnosis. Clinical confirmation by a qualified doctor is required.', 30, 805, { width: 350 });

      doc.fillColor(NAVY).font('Helvetica-Bold').text('VISION AI', 400, 795);
      doc.fillColor(DARK_GRAY).font('Helvetica').text('Diabetic Retinopathy Screening System', 400, 805);
      doc.text(`Screening ID: ${screening.id}`, 400, 815);
      
      doc.font('Helvetica').fontSize(8).text('Initial AI Screening Report  |  Page 1 of 1', 400, 825);

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}
