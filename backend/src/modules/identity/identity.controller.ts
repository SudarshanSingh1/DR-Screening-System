import type { Request, Response } from 'express';
import { digiLockerProvider } from './providers/digilocker.provider';
import { meriPehchaanProvider } from './providers/meri_pehchaan.provider';
import { createOAuthState, validateOAuthState, finalizeVerification } from './identity.service';
import type { AuthApiResponse } from '../../types/auth';

/** POST /api/auth/identity/digilocker/init */
export async function initDigiLocker(req: Request, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const state = await createOAuthState('DIGILOCKER', req.session.user?.id);
    const { url } = await digiLockerProvider.getAuthorizationUrl(state);
    res.status(200).json({ success: true, data: { url } });
  } catch (err) {
    handleError(err, res);
  }
}

/** POST /api/auth/identity/meri-pehchaan/init */
export async function initMeriPehchaan(req: Request, res: Response<AuthApiResponse>): Promise<void> {
  try {
    const state = await createOAuthState('MERI_PEHCHAAN', req.session.user?.id);
    const { url } = await meriPehchaanProvider.getAuthorizationUrl(state);
    res.status(200).json({ success: true, data: { url } });
  } catch (err) {
    handleError(err, res);
  }
}

/** GET /api/auth/identity/digilocker/callback */
export async function digiLockerCallback(req: Request, res: Response): Promise<void> {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    
    if (!code || !state) throw Object.assign(new Error('Missing code or state'), { status: 400 });

    const userId = await validateOAuthState(state, 'DIGILOCKER');
    if (!userId) throw Object.assign(new Error('Identity verification requires an active session bound to the request'), { status: 401 });

    const { externalReference } = await digiLockerProvider.handleCallback(code, state);
    const { status } = await finalizeVerification(userId, 'DIGILOCKER', externalReference);

    if (req.session.user && req.session.user.id === userId) {
      req.session.user.status = status as any;
    }

    res.redirect('/identity-verification?success=true');
  } catch (err) {
    console.error('[identity.controller] Callback error:', err);
    res.redirect('/identity-verification?success=false');
  }
}

/** GET /api/auth/identity/meri-pehchaan/callback */
export async function meriPehchaanCallback(req: Request, res: Response): Promise<void> {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    
    if (!code || !state) throw Object.assign(new Error('Missing code or state'), { status: 400 });

    const userId = await validateOAuthState(state, 'MERI_PEHCHAAN');
    if (!userId) throw Object.assign(new Error('Identity verification requires an active session bound to the request'), { status: 401 });

    const { externalReference } = await meriPehchaanProvider.handleCallback(code, state);
    const { status } = await finalizeVerification(userId, 'MERI_PEHCHAAN', externalReference);

    if (req.session.user && req.session.user.id === userId) {
      req.session.user.status = status as any;
    }

    res.redirect('/identity-verification?success=true');
  } catch (err) {
    console.error('[identity.controller] Callback error:', err);
    res.redirect('/identity-verification?success=false');
  }
}

function handleError(err: unknown, res: Response<AuthApiResponse>): void {
  const e = err as { message?: string; code?: string; status?: number };
  const status = e.status ?? 500;
  const code = e.code ?? 'INTERNAL_ERROR';
  
  let error = status < 500 ? (e.message ?? 'Request failed.') : 'An unexpected error occurred.';

  if (status === 503) {
    if (code === 'PROVIDER_NOT_CONFIGURED') {
      // Identity errors are generic in the provider base, but we can return a friendly message
      error = 'This identity provider integration is not configured.';
    }
  }

  if (status >= 500) console.error('[identity.controller]', err);
  res.status(status).json({ success: false, error, code });
}
