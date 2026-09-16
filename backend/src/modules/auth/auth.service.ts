import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { otpProvider } from '../../providers/otp/msg91.provider';
import { emailProvider } from '../../providers/email/nodemailer.provider';
import { logger } from '../../config/logger';
import type { SendOtpInput, VerifyOtpInput, RegisterInput, LoginInput, ActivateAccountInput } from './auth.schema';
import type { SessionUser, UserRole } from '../../types/auth';

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;

/** Generate a cryptographically secure numeric OTP */
function generateOtp(): string {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(OTP_LENGTH, '0');
}

/** Convert DB Role enum to frontend UserRole type */
function toUserRole(dbRole: string): UserRole {
  const map: Record<string, UserRole> = {
    PATIENT: 'patient',
    SCREENING_STAFF: 'screening_staff',
    DOCTOR: 'doctor',
    ENGINEER_ADMIN: 'engineer_admin',
  };
  return map[dbRole] ?? 'patient';
}

/** Mask phone for safe display and session storage */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return `+91 XXXXX ${digits.slice(-5)}`;
}

/** Mask email for safe display */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

// ─── OTP ────────────────────────────────────────────────────────────────────

export async function sendOtp(input: SendOtpInput, ip: string): Promise<void> {
  const { phone, purpose } = input;

  // Invalidate any previous unused OTP challenges for this phone+purpose
  await prisma.otpChallenge.updateMany({
    where: { phone, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  // Generate and hash OTP — raw value never stored
  const rawOtp = generateOtp();
  const otpHash = await bcrypt.hash(rawOtp, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

  await prisma.otpChallenge.create({
    data: { phone, purpose, otpHash, expiresAt },
  });

  // Dispatch via SMS provider (throws 503 if not configured)
  await otpProvider.send(phone, rawOtp);

  await prisma.auditLog.create({
    data: { event: 'OTP_SENT', ipAddress: ip, metadata: { purpose, phone: phone.slice(-4).padStart(10, '*') } },
  });
}

export async function verifyOtp(
  input: VerifyOtpInput,
  ip: string,
): Promise<SessionUser> {
  const { phone, otp, purpose } = input;

  // Find the most recent valid challenge
  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      phone,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!challenge) {
    await prisma.auditLog.create({
      data: { event: 'OTP_VERIFY_FAILED_NO_CHALLENGE', ipAddress: ip },
    });
    throw Object.assign(new Error('No valid OTP found. Please request a new code.'), {
      code: 'OTP_NOT_FOUND',
      status: 400,
    });
  }

  // Enforce attempt limit
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.auditLog.create({
      data: { event: 'OTP_VERIFY_FAILED_MAX_ATTEMPTS', ipAddress: ip },
    });
    throw Object.assign(new Error('Maximum OTP attempts exceeded. Please request a new code.'), {
      code: 'OTP_MAX_ATTEMPTS_EXCEEDED',
      status: 429,
    });
  }

  const valid = await bcrypt.compare(otp, challenge.otpHash);
  if (!valid) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    await prisma.auditLog.create({
      data: { event: 'OTP_VERIFY_FAILED_WRONG_CODE', ipAddress: ip },
    });
    throw Object.assign(new Error('Incorrect OTP. Please try again.'), {
      code: 'OTP_INVALID',
      status: 400,
    });
  }

  // Mark as consumed
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  // Find or create user by phone
  let user = await prisma.user.findUnique({ where: { phone }, include: { patientProfile: true, staffProfile: true, doctorProfile: true } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, role: 'PATIENT', status: 'ACTIVE' },
      include: { patientProfile: true, staffProfile: true, doctorProfile: true }
    });
  } else if (user.status === 'PENDING_VERIFICATION' && user.role === 'PATIENT') {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE' },
      include: { patientProfile: true, staffProfile: true, doctorProfile: true }
    });
  }

  if (user.status === 'SUSPENDED') {
    throw Object.assign(new Error('Account suspended. Contact support.'), {
      code: 'ACCOUNT_SUSPENDED',
      status: 403,
    });
  }

  await prisma.auditLog.create({
    data: { event: 'OTP_VERIFY_SUCCESS', userId: user.id, ipAddress: ip },
  });

  return {
    id: user.id,
    firstName: user.patientProfile?.firstName || user.staffProfile?.professionalName || user.doctorProfile?.professionalName || null,
    role: toUserRole(user.role),
    status: user.status.toLowerCase() as SessionUser['status'],
    maskedPhone: maskPhone(phone),
  };
}

// ─── Registration ────────────────────────────────────────────────────────────

export async function registerUser(input: RegisterInput, ip: string): Promise<SessionUser> {
  // Security Rule: Public self-registration is disabled for all roles.
  // Patients are created via staff /admin/create. Staff and Doctors are created by admin provisioning.
  throw Object.assign(new Error('Public self-registration is disabled. Contact your administrator or screening staff.'), {
    code: 'REGISTRATION_DISABLED',
    status: 403,
  });
}


// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginUser(input: LoginInput, ip: string): Promise<SessionUser> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { credential: true, patientProfile: true, staffProfile: true, doctorProfile: true },
  });

  // Use constant-time comparison to prevent user enumeration
  const dummyHash = '$2b$12$invalidhashfortimingnormalization.invalidhashpadding00';
  const storedHash = user?.credential?.passwordHash ?? dummyHash;
  const passwordValid = await bcrypt.compare(password, storedHash);

  if (!user || !passwordValid || !user.credential) {
    await prisma.auditLog.create({
      data: {
        event: 'LOGIN_FAILED',
        ipAddress: ip,
        metadata: { reason: 'invalid_credentials' },
      },
    });
    throw Object.assign(new Error('Invalid email or password.'), {
      code: 'INVALID_CREDENTIALS',
      status: 401,
    });
  }

  if (user.status === 'SUSPENDED') {
    throw Object.assign(new Error('Account suspended. Contact support.'), {
      code: 'ACCOUNT_SUSPENDED',
      status: 403,
    });
  }

  await prisma.auditLog.create({
    data: { event: 'LOGIN_SUCCESS', userId: user.id, ipAddress: ip },
  });

  return {
    id: user.id,
    firstName: user.patientProfile?.firstName || user.staffProfile?.professionalName || user.doctorProfile?.professionalName || null,
    role: toUserRole(user.role),
    status: user.status.toLowerCase() as SessionUser['status'],
    maskedEmail: maskEmail(email),
  };
}

// ─── Account Activation ───────────────────────────────────────────────────────
// Canonical, role-independent activation. Works for PATIENT, SCREENING_STAFF,
// DOCTOR, and any future role that uses AccountActivationToken provisioning.

export async function activateAccount(
  input: ActivateAccountInput,
  ip: string,
): Promise<{ role: UserRole }> {
  const { token: rawToken, password } = input;

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const activationToken = await prisma.accountActivationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!activationToken) {
    throw Object.assign(new Error('Invalid activation token.'), {
      code: 'INVALID_TOKEN',
      status: 400,
    });
  }
  if (activationToken.usedAt) {
    throw Object.assign(new Error('This activation link has already been used.'), {
      code: 'TOKEN_ALREADY_USED',
      status: 400,
    });
  }
  if (activationToken.expiresAt < new Date()) {
    throw Object.assign(new Error('Activation link has expired. Contact your administrator.'), {
      code: 'TOKEN_EXPIRED',
      status: 400,
    });
  }

  const newPasswordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Use a transaction to ensure atomicity: credential + token mark + status update
  await prisma.$transaction([
    prisma.userCredential.upsert({
      where: { userId: activationToken.userId },
      update: { passwordHash: newPasswordHash, credentialType: 'PASSWORD' },
      create: { userId: activationToken.userId, passwordHash: newPasswordHash, credentialType: 'PASSWORD' },
    }),
    prisma.accountActivationToken.update({
      where: { id: activationToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: activationToken.userId },
      data: { status: 'ACTIVE' },
    }),
  ]);

  await prisma.auditLog.create({
    data: { event: 'ACCOUNT_ACTIVATED', userId: activationToken.userId, ipAddress: ip },
  });

  // Return only the role so the frontend can redirect correctly.
  // Never return the token, hash, userId in a guessable form, or credentials.
  return { role: toUserRole(activationToken.user.role) };
}
