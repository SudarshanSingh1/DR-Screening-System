import { Router } from 'express';
import * as ctrl from './password.controller';
import { validate } from '../../middleware/validate.middleware';
import { passwordResetRateLimit } from '../../middleware/rate_limit.middleware';
import { ForgotPasswordSchema, ResetPasswordSchema } from './password.schema';

export const passwordRouter = Router();

passwordRouter.post('/forgot', passwordResetRateLimit, validate(ForgotPasswordSchema), ctrl.forgotPassword);
passwordRouter.post('/reset', passwordResetRateLimit, validate(ResetPasswordSchema), ctrl.resetPassword);
