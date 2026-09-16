import type { Request, Response, NextFunction } from 'express';
import type { AuthApiResponse } from '../types/auth';

/** Requires a valid authenticated session. Returns 401 otherwise. */
export function requireSession(req: Request, res: Response<AuthApiResponse>, next: NextFunction): void {
  if (!req.session.user) {
    res.status(401).json({ success: false, error: 'Authentication required.', code: 'UNAUTHENTICATED' });
    return;
  }
  next();
}

/** Requires the session user to have one of the specified roles. */
export function requireRole(...roles: string[]) {
  const allowedRoles = roles.map(r => r.toUpperCase());
  return (req: Request, res: Response<AuthApiResponse>, next: NextFunction): void => {
    const user = req.session.user;
    if (!user || !allowedRoles.includes(user.role.toUpperCase())) {
      res.status(403).json({ success: false, error: 'Access denied.', code: 'FORBIDDEN' });
      return;
    }
    next();
  };
}

/** Requires the session user to be fully active (not pending verification). */
export function requireActive(req: Request, res: Response<AuthApiResponse>, next: NextFunction): void {
  const user = req.session.user;
  if (!user || user.status !== 'active') {
    res.status(403).json({ success: false, error: 'Account pending identity verification.', code: 'FORBIDDEN_PENDING' });
    return;
  }
  next();
}
