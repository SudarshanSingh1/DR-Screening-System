import { z } from 'zod';

const phoneSchema = z.string().regex(/^\+?91\d{10}$|^\d{10}$/, 'Must be a valid Indian mobile number (10 digits)');
const emailSchema = z.string().email('Must be a valid email address');

export const ProvisionStaffSchema = z.object({
  professionalName: z.string().trim().min(1, 'Professional name is required'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  designation: z.string().optional(),
  facilityId: z.string().optional(),
  employmentStatus: z.string().default('ACTIVE'),
});

export const ProvisionDoctorSchema = z.object({
  professionalName: z.string().trim().min(1, 'Professional name is required'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  specialty: z.string().optional(),
  registrationNumber: z.string().optional(),
  facilityId: z.string().optional(),
  authorizationStatus: z.string().default('AUTHORIZED'),
});

export type ProvisionStaffInput = z.infer<typeof ProvisionStaffSchema>;
export type ProvisionDoctorInput = z.infer<typeof ProvisionDoctorSchema>;
