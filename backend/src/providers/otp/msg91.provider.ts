import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { OtpProvider } from './otp.interface';

/**
 * MSG91 OTP provider for Indian phone numbers (+91).
 * Production integration: https://msg91.com/help/OTP/api-documentation
 *
 * This provider returns 503 if MSG91_AUTH_KEY is not configured,
 * matching the frontend `config_unavailable` state.
 */
export class Msg91OtpProvider implements OtpProvider {
  private readonly configured: boolean;

  constructor() {
    this.configured = Boolean(
      env.MSG91_AUTH_KEY && env.MSG91_SENDER_ID && env.MSG91_TEMPLATE_ID,
    );
    if (!this.configured) {
      logger.warn('MSG91 OTP provider is not configured — OTP dispatch will return 503');
    }
  }

  async send(phone: string, otp: string): Promise<void> {
    if (!this.configured) {
      throw Object.assign(
        new Error('OTP provider is not configured. Set MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_TEMPLATE_ID.'),
        { code: 'OTP_PROVIDER_NOT_CONFIGURED', status: 503 },
      );
    }

    // Normalize to 10-digit number (strip leading +91 or 91)
    const normalized = phone.replace(/^\+?91/, '').replace(/\D/g, '');
    if (normalized.length !== 10) {
      throw Object.assign(new Error('Invalid Indian phone number format'), { code: 'INVALID_PHONE', status: 400 });
    }

    const url = 'https://api.msg91.com/api/v5/otp';
    const payload = {
      mobile: `91${normalized}`,
      authkey: env.MSG91_AUTH_KEY,
      otp,
      template_id: env.MSG91_TEMPLATE_ID,
      sender: env.MSG91_SENDER_ID,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, phone: '***redacted***' }, 'MSG91 OTP dispatch failed');
      throw Object.assign(new Error('OTP dispatch failed'), { code: 'OTP_SEND_FAILED', status: 502 });
    }

    logger.info({ phone: phone.slice(-4).padStart(phone.length, '*') }, 'OTP dispatched via MSG91');
  }
}

/** Singleton — resolved at startup */
export const otpProvider = new Msg91OtpProvider();
