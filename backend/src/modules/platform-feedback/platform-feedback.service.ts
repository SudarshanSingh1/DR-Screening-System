import { prisma } from '../../db/prisma';
import type { CreatePlatformFeedbackInput } from './platform-feedback.schema';
import { PlatformFeedback } from '@prisma/client';

export async function createFeedback(userId: string, input: CreatePlatformFeedbackInput): Promise<PlatformFeedback> {
  const feedback = await prisma.platformFeedback.create({
    data: {
      submittedByUserId: userId,
      category: input.category,
      text: input.text,
      screeningId: input.screeningId,
      caseReferenceId: input.caseReferenceId,
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

export async function getMyFeedbacks(userId: string): Promise<PlatformFeedback[]> {
  return prisma.platformFeedback.findMany({
    where: { submittedByUserId: userId },
    orderBy: { createdAt: 'desc' },
    include: { attachments: true }
  });
}

export async function getFeedbackById(userId: string, id: string): Promise<PlatformFeedback | null> {
  return prisma.platformFeedback.findFirst({
    where: { id, submittedByUserId: userId },
    include: { attachments: true }
  });
}
