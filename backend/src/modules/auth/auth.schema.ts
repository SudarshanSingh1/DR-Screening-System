import { z } from 'zod';

/** Indian mobile number: 10 digits, optionally prefixed with +91 or 91 */
const phoneSchema = z
  .string()
  .regex(/^\+?91\d{10}$|^\d{10}$/, 'Must be a valid Indian mobile number (10 digits)');

const emailSchema = z.string().email('Must be a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const roleSchema = z.enum(['patient', 'screening_staff', 'doctor', 'engineer_admin']);

export const SendOtpSchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET']).default('LOGIN'),
});

export const VerifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
  purpose: z.enum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET']).default('LOGIN'),
});

export const RegisterSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  role: roleSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema.optional(),
}).refine(
  (d) => d.email || d.phone,
  { message: 'Either email or phone is required' },
);

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberDevice: z.boolean().optional().default(false),
});

export const ActivateAccountSchema = z.object({
  token: z.string().min(64, 'Token is required').max(64, 'Token format invalid'),
  password: passwordSchema,
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ActivateAccountInput = z.infer<typeof ActivateAccountSchema>;
