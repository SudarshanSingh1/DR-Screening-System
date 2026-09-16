import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import type { AuthApiResponse } from '../types/auth';

/**
 * Validates req.body against a Zod schema.
 * Returns 400 with field-level errors on failure.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response<AuthApiResponse>, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      res.status(400).json({
        success: false,
        error: errors.join('; '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
