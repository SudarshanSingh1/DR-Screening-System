import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import type { IdentityProvider } from '@prisma/client';

const OAUTH_STATE_EXPIRY_MINUTES = 15;

/**
 * Creates a cryptographically secure OAuth state, stores it securely, 
 * and returns the raw string for the authorization URL.
 */
export async function createOAuthState(provider: IdentityProvider, userId?: string): Promise<string> {
  const rawState = crypto.randomBytes(32).toString('hex');
  const stateHash = crypto.createHash('sha256').update(rawState).digest('hex');
  const expiresAt = new Date(Date.now() + OAUTH_STATE_EXPIRY_MINUTES * 60_000);

  await prisma.oAuthState.create({
    data: {
      provider,
      stateHash,
      userId,
      expiresAt,
    },
  });

  return rawState;
}

/**
 * Validates the OAuth state from the callback, enforcing single-use and expiration.
 */
export async function validateOAuthState(rawState: string, provider: IdentityProvider): Promise<string | null> {
  if (!rawState) throw new Error('State parameter is missing');

  const stateHash = crypto.createHash('sha256').update(rawState).digest('hex');

  const stateRecord = await prisma.oAuthState.findUnique({
    where: { stateHash },
  });

  if (!stateRecord) {
    throw Object.assign(new Error('Invalid OAuth state'), { code: 'INVALID_STATE', status: 400 });
  }
  
  if (stateRecord.provider !== provider) {
    throw Object.assign(new Error('OAuth state provider mismatch'), { code: 'INVALID_STATE_PROVIDER', status: 400 });
  }

  if (stateRecord.consumedAt || stateRecord.expiresAt < new Date()) {
    throw Object.assign(new Error('OAuth state is expired or already used'), { code: 'EXPIRED_STATE', status: 400 });
  }

  // Mark as consumed to prevent replay attacks
  await prisma.oAuthState.update({
    where: { id: stateRecord.id },
    data: { consumedAt: new Date() },
  });

  return stateRecord.userId;
}

/**
 * Finalizes the identity verification by storing the opaque reference.
 * Evaluates role-based activation policy to prevent privilege escalation.
 */
export async function finalizeVerification(userId: string, provider: IdentityProvider, externalReference: string): Promise<{ status: string }> {
  await prisma.identityVerification.create({
    data: {
      userId,
      provider,
      externalReference,
      status: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Strict privilege escalation prevention:
  // Only PATIENTs automatically become ACTIVE after identity verification.
  // DOCTOR, SCREENING_STAFF, and ENGINEER_ADMIN must remain PENDING_VERIFICATION 
  // until an explicit backend administrative approval process verifies their credentials.
  if (user && user.role === 'PATIENT') {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });
    return { status: 'active' };
  }
  
  return { status: user?.status.toLowerCase() ?? 'pending_verification' };
}
