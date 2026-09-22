import { z } from 'zod';

export const PatientSearchSchema = z.object({
  q: z.string().max(100, 'Search query is too long').optional().default(''),
});

export type PatientSearchQuery = z.infer<typeof PatientSearchSchema>;

export const CreatePatientSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().optional(),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().email('Invalid email address').optional(),
  aadhaarReference: z.string().trim().optional(),
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
