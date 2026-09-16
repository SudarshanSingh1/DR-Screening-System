import { Router } from 'express';
import * as ctrl from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authRateLimit, otpSendRateLimit } from '../../middleware/rate_limit.middleware';
import { SendOtpSchema, VerifyOtpSchema, RegisterSchema, LoginSchema, ActivateAccountSchema } from './auth.schema';

export const authRouter = Router();

// OTP flow
authRouter.post('/otp/send', otpSendRateLimit, validate(SendOtpSchema), ctrl.sendOtp);
authRouter.post('/otp/verify', authRateLimit, validate(VerifyOtpSchema), ctrl.verifyOtp);

// Registration & login
authRouter.post('/register', authRateLimit, validate(RegisterSchema), ctrl.registerUser);
authRouter.post('/login', authRateLimit, validate(LoginSchema), ctrl.loginUser);

// Account activation — public, token-based, role-independent
// Accepts: { token, password }. Derives account from token hash only.
authRouter.post('/activate', authRateLimit, validate(ActivateAccountSchema), ctrl.activateAccount);

// Session management
authRouter.post('/logout', ctrl.logout);
authRouter.get('/session', ctrl.getSession);
