import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { emailProvider } from '../../providers/email/nodemailer.provider';
import { env } from '../../config/env';
import type { RequestEmailVerificationInput, VerifyEmailCodeInput, ResendEmailVerificationInput } from './patient.schema';

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const ACTIVATION_TOKEN_EXPIRY_MINUTES = 24 * 60; // 24 hours

export async function requestEmailVerification(userId: string, input: RequestEmailVerificationInput, ip: string): Promise<{ requestId: string }> {
  const { email } = input;

  if (!emailProvider.isConfigured()) {
    throw Object.assign(new Error('Email provider is not configured.'), { code: 'EMAIL_PROVIDER_NOT_CONFIGURED', status: 503 });
  }

  // Ensure email is not already used by another active user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    throw Object.assign(new Error('Email is already associated with another account.'), { code: 'EMAIL_IN_USE', status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Update pending email
  await prisma.user.update({
    where: { id: userId },
    data: { pendingEmail: email },
  });

  // Generate 6 digit OTP
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const otpHash = await bcrypt.hash(rawOtp, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

  const challenge = await prisma.otpChallenge.create({
    data: {
      userId,
      email,
      purpose: 'EMAIL_VERIFICATION',
      otpHash,
      expiresAt,
    },
  });

  // Send OTP
  await emailProvider.sendEmailVerificationOtp(email, rawOtp);

  await prisma.auditLog.create({
    data: { event: 'EMAIL_VERIFICATION_REQUESTED', userId, ipAddress: ip },
  });

  return { requestId: challenge.id };
}

export async function verifyEmailCode(userId: string, input: VerifyEmailCodeInput, ip: string): Promise<void> {
  const { requestId, code } = input;

  const challenge = await prisma.otpChallenge.findUnique({
    where: { id: requestId },
  });

  if (!challenge || challenge.userId !== userId || challenge.purpose !== 'EMAIL_VERIFICATION') {
    throw Object.assign(new Error('Invalid verification request.'), { code: 'INVALID_REQUEST', status: 400 });
  }

  if (challenge.consumedAt || challenge.expiresAt < new Date()) {
    throw Object.assign(new Error('This verification code has expired. Please request a new code.'), { code: 'CODE_EXPIRED', status: 400 });
  }

  if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
    throw Object.assign(new Error('Too many verification attempts. Please request a new code.'), { code: 'TOO_MANY_ATTEMPTS', status: 400 });
  }

  const isValid = await bcrypt.compare(code, challenge.otpHash);
  if (!isValid) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: challenge.attempts + 1 },
    });
    throw Object.assign(new Error('The verification code is incorrect.'), { code: 'INVALID_CODE', status: 400 });
  }

  // Mark challenge consumed
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  // Update user email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.pendingEmail && user.pendingEmail === challenge.email) {
    
    // Optional: send notification to old email if changing
    if (user.email && user.email !== user.pendingEmail) {
      try {
        await emailProvider.sendEmailChangedNotification(user.email);
      } catch (e) {
        // Log but don't fail verification
        console.error('Failed to send email changed notification to old email', e);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: user.pendingEmail,
        emailVerified: true,
        pendingEmail: null,
      },
    });
  }

  await prisma.auditLog.create({
    data: { event: 'EMAIL_VERIFIED_SUCCESSFULLY', userId, ipAddress: ip },
  });
}

export async function resendEmailVerification(userId: string, input: ResendEmailVerificationInput, ip: string): Promise<void> {
  const { requestId } = input;

  const oldChallenge = await prisma.otpChallenge.findUnique({
    where: { id: requestId },
  });

  if (!oldChallenge || oldChallenge.userId !== userId || oldChallenge.purpose !== 'EMAIL_VERIFICATION') {
    throw Object.assign(new Error('Invalid verification request.'), { code: 'INVALID_REQUEST', status: 400 });
  }
  
  if (!oldChallenge.email) {
     throw Object.assign(new Error('No email found for this request.'), { code: 'INVALID_REQUEST', status: 400 });
  }

  // Rate limit: don't allow resend if created less than 30s ago
  if (Date.now() - oldChallenge.createdAt.getTime() < 30_000) {
    throw Object.assign(new Error('Please wait before requesting a new code.'), { code: 'RATE_LIMIT', status: 429 });
  }

  // Mark old as consumed
  await prisma.otpChallenge.update({
    where: { id: oldChallenge.id },
    data: { consumedAt: new Date() },
  });

  // Generate new
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const otpHash = await bcrypt.hash(rawOtp, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

  // Update existing challenge or create new. It's better to update the existing challenge id so frontend can keep using it
  await prisma.otpChallenge.update({
    where: { id: oldChallenge.id },
    data: {
      otpHash,
      expiresAt,
      attempts: 0,
      consumedAt: null,
      createdAt: new Date(),
    }
  });

  // Send OTP
  await emailProvider.sendEmailVerificationOtp(oldChallenge.email, rawOtp);

  await prisma.auditLog.create({
    data: { event: 'EMAIL_VERIFICATION_RESENT', userId, ipAddress: ip },
  });
}

export async function createPatientAndSendActivation(staffId: string, data: { firstName: string, lastName?: string, phone?: string, email?: string }, ip: string) {
  // Ensure we don't have dupes for auth identifiers
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw Object.assign(new Error('Email already in use.'), { code: 'EMAIL_IN_USE', status: 400 });
  }
  if (data.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw Object.assign(new Error('Phone already in use.'), { code: 'PHONE_IN_USE', status: 400 });
  }

  // Create Patient independent of User
  let patient = await prisma.patient.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      createdByStaffId: staffId
    }
  });

  let user = null;

  // Create auth User if portal access might be needed (has email or phone)
  if (data.email || data.phone) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        role: 'PATIENT',
        status: 'PENDING_VERIFICATION'
      }
    });

    // Link patient to user
    patient = await prisma.patient.update({
      where: { id: patient.id },
      data: { userId: user.id }
    });
  }

  if (data.email) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRY_MINUTES * 60_000);

    await prisma.accountActivationToken.create({
      data: {
        userId: user!.id,
        tokenHash,
        expiresAt,
      },
    });

    const activationUrl = `${env.FRONTEND_URL}/activate?token=${rawToken}`;
    await emailProvider.sendAccountActivation(data.email, activationUrl);
  }

  await prisma.auditLog.create({
    data: {
      event: 'PATIENT_CREATED_BY_STAFF',
      userId: staffId,
      ipAddress: ip,
      metadata: {
        createdPatientId: patient.id,
        createdUserId: user?.id
      }
    }
  });

  return { patient, user };
}


