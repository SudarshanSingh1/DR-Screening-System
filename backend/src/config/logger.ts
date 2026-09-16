import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
  // Redact sensitive fields from all log output
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.otp', '*.token'],
    censor: '[REDACTED]',
  },
});
