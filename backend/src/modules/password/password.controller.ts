import type { Request, Response } from 'express';
import * as passwordService from './password.service';
import type { AuthApiResponse } from '../../types/auth';
import type { ForgotPasswordInput, ResetPasswordInput } from './password.schema';

function ip(req: any): string {
  return (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace(/^::ffff:/, '');
}

/** POST /api/auth/password/forgot */
export async function forgotPassword(req: Request<unknown, AuthApiResponse, ForgotPasswordInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    await passwordService.forgotPassword(req.body, ip(req));
    // Always return success even if email not found (prevent enumeration)
    res.status(200).json({ success: true, data: { message: 'If an account exists, a reset link has been sent.' } });
  } catch (err) {
    handleError(err, res);
  }
}

/** POST /api/auth/password/reset */
export async function resetPassword(req: Request<unknown, AuthApiResponse, ResetPasswordInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    await passwordService.resetPassword(req.body, ip(req));
    res.status(200).json({ success: true, data: { message: 'Password has been reset successfully.' } });
  } catch (err) {
    handleError(err, res);
  }
}

function handleError(err: unknown, res: Response<AuthApiResponse>): void {
  const e = err as { message?: string; code?: string; status?: number };
  const status = e.status ?? 500;
  const code = e.code ?? 'INTERNAL_ERROR';
  
  let error = status < 500 ? (e.message ?? 'Request failed.') : 'An unexpected error occurred.';

  if (status === 503) {
    if (code === 'EMAIL_PROVIDER_NOT_CONFIGURED') error = 'Email service is currently unavailable.';
  }

  if (status >= 500) console.error('[password.controller]', err);
  res.status(status).json({ success: false, error, code });
}
