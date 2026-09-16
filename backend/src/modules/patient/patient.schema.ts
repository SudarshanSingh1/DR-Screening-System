import { z } from 'zod';

export const RequestEmailVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address.').max(255),
});
export type RequestEmailVerificationInput = z.infer<typeof RequestEmailVerificationSchema>;

export const VerifyEmailCodeSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required.'),
  code: z.string().length(6, 'Verification code must be 6 digits.').regex(/^\d+$/, 'Code must contain only numbers.'),
});
export type VerifyEmailCodeInput = z.infer<typeof VerifyEmailCodeSchema>;

export const ResendEmailVerificationSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required.'),
});
export type ResendEmailVerificationInput = z.infer<typeof ResendEmailVerificationSchema>;


