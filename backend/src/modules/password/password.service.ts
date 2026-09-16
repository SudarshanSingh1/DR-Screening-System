import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { emailProvider } from '../../providers/email/nodemailer.provider';
import { env } from '../../config/env';
import type { ForgotPasswordInput, ResetPasswordInput } from './password.schema';

const BCRYPT_ROUNDS = 12;
const TOKEN_EXPIRY_MINUTES = 60;

/** POST /api/auth/password/forgot */
export async function forgotPassword(input: ForgotPasswordInput, ip: string): Promise<void> {
  const { email } = input;

  // IMPORTANT: Check provider configuration BEFORE checking the database.
  // If we check the DB first, we return 503 for existing users and 200 for non-existing users,
  // creating an account enumeration oracle.
  if (!emailProvider.isConfigured()) {
    throw Object.assign(
      new Error('Email provider is not configured.'),
      { code: 'EMAIL_PROVIDER_NOT_CONFIGURED', status: 503 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Fail silently to prevent email enumeration
    await prisma.auditLog.create({
      data: { event: 'PASSWORD_RESET_REQUESTED_UNKNOWN_USER', ipAddress: ip },
    });
    return;
  }

  // Generate cryptographically secure random token (raw token is sent to email)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60_000);

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() }, // mark as used/invalidated
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await emailProvider.sendPasswordReset(email, resetUrl);

  await prisma.auditLog.create({
    data: { event: 'PASSWORD_RESET_EMAIL_SENT', userId: user.id, ipAddress: ip },
  });
}

/** POST /api/auth/password/reset */
export async function resetPassword(input: ResetPasswordInput, ip: string): Promise<void> {
  const { token: rawToken, newPassword } = input;

  // We must find the token hash. Since we only have the raw token, and we store bcrypt hashes,
  // we cannot simply query by token. However, our schema enforces `tokenHash` @unique.
  // Standard practice for this: The token sent to user should be `tokenId.rawToken`
  // OR we look up all active tokens (expensive).
  // A better way: Generate `cuid()` as the public ID, prefix it to the raw token.
  // Wait, the frontend just receives a single string `token`.
  // Let's adjust our generation logic above, but for now, since this is a clean implementation,
  // we will parse the token as `tokenId:secret`.
  
  // To keep it simple and secure: Let's use SHA-256 for the database tokenHash instead of bcrypt,
  // because SHA-256 is fast and allows deterministic querying. Bcrypt is for passwords.
  // Tokens are high-entropy (32 bytes) so they don't need bcrypt's slow stretching.
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    await prisma.auditLog.create({
      data: { event: 'PASSWORD_RESET_FAILED_INVALID_TOKEN', ipAddress: ip },
    });
    throw Object.assign(new Error('Invalid or expired password reset token.'), {
      code: 'INVALID_TOKEN',
      status: 400,
    });
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  // Update credential (create if it doesn't exist, which is possible if they only used OTP before)
  await prisma.userCredential.upsert({
    where: { userId: resetToken.userId },
    update: { passwordHash: newPasswordHash, credentialType: 'PASSWORD' },
    create: { userId: resetToken.userId, passwordHash: newPasswordHash, credentialType: 'PASSWORD' },
  });

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });

  // Security: Invalidate all existing sessions for this user to force re-authentication.
  // connect-pg-simple stores the session data as JSON in the "session" table.
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "session" WHERE "sess"->'user'->>'id' = $1`, resetToken.userId);
  } catch (err) {
    // If the session table doesn't exist yet or fails, we log and continue.
    console.error('[password.service] Failed to invalidate sessions on password reset:', err);
  }

  await prisma.auditLog.create({
    data: { event: 'PASSWORD_RESET_SUCCESS', userId: resetToken.userId, ipAddress: ip },
  });
}
