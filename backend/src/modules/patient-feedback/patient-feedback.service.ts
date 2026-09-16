import { prisma } from '../../db/prisma';
import type { CreatePatientFeedbackInput } from './patient-feedback.schema';
import { PatientFeedback, PatientFeedbackAttachment } from '@prisma/client';

export async function createFeedback(patientId: string, input: CreatePatientFeedbackInput): Promise<PatientFeedback> {
  const feedback = await prisma.patientFeedback.create({
    data: {
      patientId,
      category: input.category,
      text: input.text,
      attachments: {
        create: input.attachments?.map(att => ({
          type: att.type,
          fileKey: att.fileKey,
          mimeType: att.mimeType,
          sizeBytes: att.sizeBytes,
        })) || []
      }
    },
    include: {
      attachments: true
    }
  });

  return feedback;
}

export async function getFeedbacks(patientId: string): Promise<PatientFeedback[]> {
  return prisma.patientFeedback.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: { attachments: true }
  });
}

export async function getFeedbackById(patientId: string, id: string): Promise<PatientFeedback | null> {
  return prisma.patientFeedback.findFirst({
    where: { id, patientId },
    include: { attachments: true }
  });
}
