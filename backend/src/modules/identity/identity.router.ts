import { Router } from 'express';
import * as ctrl from './identity.controller';
import { requireSession } from '../../middleware/auth.middleware';

export const identityRouter = Router();

// Init endpoints - must be logged in to start verification
identityRouter.post('/digilocker/init', requireSession, ctrl.initDigiLocker);
identityRouter.post('/meri-pehchaan/init', requireSession, ctrl.initMeriPehchaan);

// Callback endpoints (these are hit by the provider redirecting the user browser back)
identityRouter.get('/digilocker/callback', ctrl.digiLockerCallback);
identityRouter.get('/meri-pehchaan/callback', ctrl.meriPehchaanCallback);
