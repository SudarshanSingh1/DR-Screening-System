import { z } from 'zod';
import { PlatformFeedbackCategory } from '@prisma/client';

export const CreatePlatformFeedbackSchema = z.object({
  category: z.nativeEnum(PlatformFeedbackCategory, { required_error: 'Feedback category is required.' }),
  text: z.string().min(1, 'Text feedback is required.'),
  screeningId: z.string().optional(),
  caseReferenceId: z.string().optional(),
  attachments: z.array(z.object({
    type: z.literal('IMAGE'),
    fileKey: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number().int().positive(),
  })).optional()
});

export type CreatePlatformFeedbackInput = z.infer<typeof CreatePlatformFeedbackSchema>;
