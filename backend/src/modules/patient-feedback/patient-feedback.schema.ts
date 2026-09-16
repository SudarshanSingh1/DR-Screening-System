import { z } from 'zod';
import { PatientFeedbackCategory } from '@prisma/client';

export const CreatePatientFeedbackSchema = z.object({
  category: z.nativeEnum(PatientFeedbackCategory, { required_error: 'Feedback category is required.' }),
  text: z.string().optional(),
  attachments: z.array(z.object({
    type: z.enum(['IMAGE', 'VOICE']),
    fileKey: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number().int().positive(),
  })).optional()
}).refine(data => data.text || (data.attachments && data.attachments.length > 0), {
  message: 'Either text or an attachment (voice/image) is required.',
  path: ['text']
});

export type CreatePatientFeedbackInput = z.infer<typeof CreatePatientFeedbackSchema>;
