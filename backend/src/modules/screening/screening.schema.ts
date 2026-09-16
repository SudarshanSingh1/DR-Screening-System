import { z } from 'zod';

export const CreateScreeningSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
});

export const ScreeningQuerySchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED']).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateScreeningInput = z.infer<typeof CreateScreeningSchema>;
