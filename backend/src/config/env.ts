import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  SESSION_MAX_AGE_MS: z.coerce.number().default(86_400_000),

  // Configure reverse proxy trust. E.g., '1' for Nginx, 'false' for local docker directly exposed.
  TRUST_PROXY: z.string().default('false'),

  ALLOWED_ORIGIN: z.string().default('http://localhost:5173'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // OTP — all optional; absence means OTP feature returns 503
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),

  // Email — all optional; absence means email feature returns 503
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Government identity providers — optional; absence means 503
  DIGILOCKER_CLIENT_ID: z.string().optional(),
  DIGILOCKER_CLIENT_SECRET: z.string().optional(),
  DIGILOCKER_REDIRECT_URI: z.string().optional(),
  MERI_PEHCHAAN_CLIENT_ID: z.string().optional(),
  MERI_PEHCHAAN_CLIENT_SECRET: z.string().optional(),
  MERI_PEHCHAAN_REDIRECT_URI: z.string().optional(),
});

function loadEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment configuration error:');
    result.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
export type Env = typeof env;
