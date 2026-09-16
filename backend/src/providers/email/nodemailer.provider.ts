import path from 'path';
import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { EmailProvider } from './email.interface';

export class NodemailerEmailProvider implements EmailProvider {
  private readonly configured: boolean;
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.configured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

    if (this.configured) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        secure: env.SMTP_SECURE === 'true',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    if (!this.configured || !this.transporter) {
      throw Object.assign(
        new Error('Email provider is not configured.'),
        { code: 'EMAIL_PROVIDER_NOT_CONFIGURED', status: 503 },
      );
    }

    await this.transporter.sendMail({
      from: env.SMTP_FROM ?? 'Vision AI Platform <noreply@visionai.health>',
      to,
      subject: 'Reset your Vision AI Platform password',
      text: `You have requested to reset your password. Please copy and paste this link into your browser to proceed: \n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#1e293b;margin-bottom:16px;">Password Reset Request</h2>
          <p style="color:#475569;line-height:1.5;margin-bottom:24px;">
            We received a request to reset the password for your Vision AI Platform account. 
            Click the button below to choose a new password:
          </p>
          <a href="${resetUrl}" 
             style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;margin-bottom:24px;">
            Reset Password
          </a>
          <p style="color:#64748b;font-size:12px;">
            This link is valid for a limited time as configured by the platform security policy.<br>
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    logger.info({ to: to.replace(/(.{2}).*@/, '$1***@') }, 'Password reset email dispatched');
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    if (!this.configured || !this.transporter) {
      throw Object.assign(
        new Error('Email provider is not configured.'),
        { code: 'EMAIL_PROVIDER_NOT_CONFIGURED', status: 503 },
      );
    }

    const appUrl = env.FRONTEND_URL ?? 'http://localhost:3000';

    await this.transporter.sendMail({
      from: env.SMTP_FROM ?? 'Vision AI Platform <noreply@visionai.health>',
      to,
      subject: `Welcome to Vision AI Platform, ${firstName}`,
      text: `Welcome to Vision AI Platform, ${firstName}\n\nThank you for joining Vision AI Platform.\n\nYour account has been successfully created, and you are now part of a platform built to support earlier detection and smarter screening through AI-powered technology.\n\nThe platform supports:\n- Secure access to screening information\n- Uploading and reviewing retinal images\n- AI-powered screening insights\n- Tracking relevant screening activity over time\n\nGO TO VISION AI PLATFORM: ${appUrl}\n\nVISION AI PLATFORM\nEarly Detection · Brighter Tomorrows\n\nThis email was sent because a Vision AI Platform account was created using this email address.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background-color:#ffffff;">
          <div style="text-align:center;margin-bottom:32px;">
            <img src="cid:visionai-logo" alt="Vision AI Platform Logo" style="max-width:140px;width:100%;height:auto;display:block;margin:0 auto;">
          </div>
          <h2 style="color:#1e3a8a;margin-bottom:16px;">Welcome to Vision AI Platform, ${firstName}</h2>
          <p style="color:#475569;line-height:1.6;margin-bottom:16px;">Thank you for joining Vision AI Platform.</p>
          <p style="color:#475569;line-height:1.6;margin-bottom:24px;">Your account has been successfully created, and you are now part of a platform built to support earlier detection and smarter screening through AI-powered technology.</p>
          
          <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="color:#1e3a8a;font-weight:bold;margin-top:0;margin-bottom:12px;">The platform supports:</p>
            <ul style="color:#475569;line-height:1.6;margin:0;padding-left:20px;">
              <li style="margin-bottom:8px;">Secure access to screening information</li>
              <li style="margin-bottom:8px;">Uploading and reviewing retinal images</li>
              <li style="margin-bottom:8px;">AI-powered screening insights</li>
              <li>Tracking relevant screening activity over time</li>
            </ul>
          </div>

          <div style="text-align:center;margin-bottom:32px;">
            <a href="${appUrl}"
               style="display:inline-block;padding:14px 28px;background-color:#2663eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;letter-spacing:0.5px;">
              GO TO VISION AI PLATFORM
            </a>
          </div>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
          
          <div style="text-align:center;">
            <p style="color:#1e3a8a;font-weight:bold;font-size:12px;letter-spacing:1px;margin-bottom:4px;margin-top:0;">
              VISION AI PLATFORM
            </p>
            <p style="color:#94a3b8;font-size:11px;margin-top:0;margin-bottom:16px;">
              Early Detection &middot; Brighter Tomorrows
            </p>
            <p style="color:#94a3b8;font-size:10px;line-height:1.4;margin:0;">
              This email was sent because a Vision AI Platform account was created using this email address.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'vision-ai-logo.png',
          path: path.join(process.cwd(), 'assets', 'VisionAi.png'),
          cid: 'visionai-logo',
        },
      ],
    });

    logger.info({ to: to.replace(/(.{2}).*@/, '$1***@') }, 'Welcome email dispatched');
  }

  async sendEmailVerificationOtp(to: string, otp: string): Promise<void> {
    if (!this.configured || !this.transporter) {
      throw Object.assign(new Error('Email provider is not configured.'), { code: 'EMAIL_PROVIDER_NOT_CONFIGURED', status: 503 });
    }

    await this.transporter.sendMail({
      from: env.SMTP_FROM ?? 'Vision AI Platform <noreply@visionai.health>',
      to,
      subject: 'Verify your email address',
      text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#1e293b;margin-bottom:16px;">Verify your email</h2>
          <p style="color:#475569;line-height:1.5;margin-bottom:24px;">
            Use the following code to verify your email address:
          </p>
          <div style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#2563eb;text-align:center;padding:16px;background:#f8fafc;border-radius:6px;margin-bottom:24px;">
            ${otp}
          </div>
          <p style="color:#64748b;font-size:12px;">
            This code will expire in 10 minutes.
          </p>
        </div>
      `,
    });
    logger.info({ to: to.replace(/(.{2}).*@/, '$1***@') }, 'Email verification OTP dispatched');
  }

  async sendEmailChangedNotification(to: string): Promise<void> {
    if (!this.configured || !this.transporter) return;

    await this.transporter.sendMail({
      from: env.SMTP_FROM ?? 'Vision AI Platform <noreply@visionai.health>',
      to,
      subject: 'Security Alert: Your email address was changed',
      text: `This is a notification that the email address associated with your Vision AI Platform account was recently changed.\n\nIf you did not authorize this change, please contact support immediately.`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#1e293b;margin-bottom:16px;">Security Alert</h2>
          <p style="color:#475569;line-height:1.5;margin-bottom:24px;">
            This is a notification that the email address associated with your Vision AI Platform account was recently changed.
          </p>
          <p style="color:#b91c1c;font-size:14px;font-weight:bold;">
            If you did not authorize this change, please contact support immediately.
          </p>
        </div>
      `,
    });
    logger.info({ to: to.replace(/(.{2}).*@/, '$1***@') }, 'Email changed notification dispatched');
  }

  async sendAccountActivation(to: string, activationUrl: string): Promise<void> {
    if (!this.configured || !this.transporter) {
      throw Object.assign(new Error('Email provider is not configured.'), { code: 'EMAIL_PROVIDER_NOT_CONFIGURED', status: 503 });
    }

    await this.transporter.sendMail({
      from: env.SMTP_FROM ?? 'Vision AI Platform <noreply@visionai.health>',
      to,
      subject: 'Activate your Vision AI Platform account',
      text: `Your account has been created. Please click the link to set your password and activate your account: \n\n${activationUrl}`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#1e293b;margin-bottom:16px;">Activate Account</h2>
          <p style="color:#475569;line-height:1.5;margin-bottom:24px;">
            An account has been created for you on the Vision AI Platform.
            Click the button below to set your password and activate your account.
          </p>
          <a href="${activationUrl}" 
             style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;margin-bottom:24px;">
            Set Password
          </a>
        </div>
      `,
    });
    logger.info({ to: to.replace(/(.{2}).*@/, '$1***@') }, 'Account activation email dispatched');
  }
}

export const emailProvider = new NodemailerEmailProvider();
