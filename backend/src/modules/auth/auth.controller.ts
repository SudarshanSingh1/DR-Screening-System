import type { Request, Response } from 'express';
import * as authService from './auth.service';
import type { AuthApiResponse, SessionUser } from '../../types/auth';
import type { SendOtpInput, VerifyOtpInput, RegisterInput, LoginInput, ActivateAccountInput } from './auth.schema';

function ip(req: any): string {
  return (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace(/^::ffff:/, '');
}

/** POST /api/auth/otp/send */
export async function sendOtp(req: Request<unknown, AuthApiResponse, SendOtpInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    await authService.sendOtp(req.body, ip(req));
    res.status(200).json({ success: true, data: { message: 'OTP dispatched successfully.' } });
  } catch (err) {
    handleError(err, res);
  }
}

/** POST /api/auth/otp/verify */
export async function verifyOtp(req: Request<unknown, AuthApiResponse, VerifyOtpInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const user = await authService.verifyOtp(req.body, ip(req));
    req.session.user = user;
    // Regenerate session ID on privilege change to prevent session fixation
    req.session.regenerate((err) => {
      if (err) { res.status(500).json({ success: false, error: 'Session error.', code: 'SESSION_ERROR' }); return; }
      req.session.user = user;
      res.status(200).json({ success: true, data: safeUser(user) });
    });
  } catch (err) {
    handleError(err, res);
  }
}

/** POST /api/auth/register */
export async function registerUser(req: Request<unknown, AuthApiResponse, RegisterInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const user = await authService.registerUser(req.body, ip(req));
    req.session.regenerate((err) => {
      if (err) { res.status(500).json({ success: false, error: 'Session error.', code: 'SESSION_ERROR' }); return; }
      req.session.user = user;
      res.status(201).json({ success: true, data: safeUser(user) });
    });
  } catch (err) {
    handleError(err, res);
  }
}

/** POST /api/auth/login */
export async function loginUser(req: Request<unknown, AuthApiResponse, LoginInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const user = await authService.loginUser(req.body, ip(req));
    req.session.regenerate((err) => {
      if (err) { res.status(500).json({ success: false, error: 'Session error.', code: 'SESSION_ERROR' }); return; }
      req.session.user = user;
      res.status(200).json({ success: true, data: safeUser(user) });
    });
  } catch (err) {
    handleError(err, res);
  }
}

/** POST /api/auth/logout */
export async function logout(req: Request, res: Response<AuthApiResponse>): Promise<void> {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, error: 'Logout failed.', code: 'SESSION_ERROR' });
      return;
    }
    res.clearCookie('visionai.sid');
    res.status(200).json({ success: true });
  });
}

/** GET /api/auth/session */
export async function getSession(req: Request, res: Response<AuthApiResponse>): Promise<void> {
  if (!req.session.user) {
    res.status(401).json({ success: false, error: 'Not authenticated.', code: 'UNAUTHENTICATED' });
    return;
  }
  res.status(200).json({ success: true, data: safeUser(req.session.user) });
}

/** Return only non-sensitive session fields */
function safeUser(user: SessionUser) {
  return {
    id: user.id,
    firstName: user.firstName,
    role: user.role,
    status: user.status,
    maskedPhone: user.maskedPhone,
    maskedEmail: user.maskedEmail,
  };
}

function handleError(err: unknown, res: Response<AuthApiResponse>): void {
  const e = err as { message?: string; code?: string; status?: number };
  const status = e.status ?? 500;
  const code = e.code ?? 'INTERNAL_ERROR';
  
  let error = status < 500 ? (e.message ?? 'Request failed.') : 'An unexpected error occurred.';

  // Map typed 503 provider errors to safe user-facing messages
  if (status === 503) {
    if (code === 'OTP_PROVIDER_NOT_CONFIGURED') error = 'SMS OTP service is not configured. Please contact the system administrator.';
  }

  // Log 5xx internally — don't expose internals to client
  if (status >= 500) console.error('[auth.controller]', err);
  res.status(status).json({ success: false, error, code });
}
/** POST /api/auth/activate
 * Role-independent account activation.
 * Accepts a raw token and new password. Derives the account exclusively from
 * the stored token hash — the client must NOT send userId, role, or email.
 * Returns the role so the frontend can redirect to /patient, /staff, or /doctor.
 */
export async function activateAccount(req: Request<unknown, AuthApiResponse, ActivateAccountInput>, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const result = await authService.activateAccount(req.body, ip(req));
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    handleError(err, res);
  }
}
