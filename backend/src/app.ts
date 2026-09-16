import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';

import { authRouter } from './modules/auth/auth.router';
import { passwordRouter } from './modules/password/password.router';
import { identityRouter } from './modules/identity/identity.router';
import { patientRouter } from './modules/patient/patient.router';
import { patientFeedbackRouter } from './modules/patient-feedback/patient-feedback.router';
import { platformFeedbackRouter } from './modules/platform-feedback/platform-feedback.router';
import { staffRouter } from './modules/staff/staff.router';
import { adminRouter } from './modules/admin/admin.router';
import { storageRouter } from './modules/storage/storage.router';

import { doctorRouter } from './modules/doctor/doctor.router';

const PgStore = pgSession(session);

export const app = express();

// Trust reverse proxy for accurate client IPs, based on environment configuration.
// If 'false', ignores forwarded headers. If '1', trusts the first hop (e.g. Nginx).
const trustProxyVal = env.TRUST_PROXY === 'false' ? false : (isNaN(Number(env.TRUST_PROXY)) ? env.TRUST_PROXY : Number(env.TRUST_PROXY));
app.set('trust proxy', trustProxyVal);

// Security headers
app.use(helmet());

// CORS - Restricted to the exact frontend origin
app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    credentials: true, // required for cookies
  }),
);

// Logging
app.use(
  pinoHttp({
    logger,
    // Do not log request/response body globally to prevent PII leaks
    autoLogging: { ignore: (req) => req.url?.startsWith('/health') ?? false },
  }),
);

// Body parsers
// Only application/json is accepted. urlencoded is removed to prevent Simple Request CSRF.
app.use(express.json());

// Handle malformed JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    res.status(400).json({ success: false, error: 'Malformed JSON payload', code: 'INVALID_JSON' });
    return;
  }
  next();
});

// Session configuration
app.use(
  session({
    store: new PgStore({
      conString: env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: env.SESSION_MAX_AGE_MS,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax', // Must be lax to allow OAuth callbacks, or strict if fully internal
    },
    name: 'visionai.sid',
  }),
);

// API Routes
app.use('/api/patient', patientRouter);
app.use('/api/staff', staffRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/patient/feedback', patientFeedbackRouter);
app.use('/api/platform-feedback', platformFeedbackRouter);
app.use('/api/auth/password', passwordRouter);
app.use('/api/auth/identity', identityRouter);
app.use('/api/auth', authRouter);
app.use('/api/storage', storageRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ success: false, error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
});
