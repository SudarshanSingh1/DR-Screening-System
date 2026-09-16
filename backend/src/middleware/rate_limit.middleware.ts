import rateLimit from 'express-rate-limit';
import type { AuthApiResponse } from '../types/auth';

/** General auth endpoint limiter — 20 requests per 15 minutes per IP */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  } satisfies AuthApiResponse,
});

/** Strict OTP limiter — 3 sends per 10 minutes per IP */
export const otpSendRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many OTP requests. Please wait 10 minutes before requesting a new code.',
    code: 'OTP_RATE_LIMIT_EXCEEDED',
  } satisfies AuthApiResponse,
});

/** Password reset limiter — 5 attempts per 30 minutes per IP */
export const passwordResetRateLimit = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many password reset attempts. Please wait 30 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  } satisfies AuthApiResponse,
});
