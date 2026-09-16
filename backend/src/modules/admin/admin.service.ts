import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { emailProvider } from '../../providers/email/nodemailer.provider';
import { env } from '../../config/env';
import type { ProvisionStaffInput, ProvisionDoctorInput } from './admin.schema';

const ACTIVATION_TOKEN_EXPIRY_MINUTES = 24 * 60; // 24 hours

export async function provisionStaff(adminId: string, input: ProvisionStaffInput, ip: string) {
  const { professionalName, email, phone, designation, facilityId, employmentStatus } = input;

  if (!emailProvider.isConfigured()) {
    throw Object.assign(new Error('Email service is not configured. Cannot provision accounts without activation capability.'), { status: 503 });
  }

  // Ensure no duplicate email/phone
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw Object.assign(new Error('Email already in use.'), { code: 'EMAIL_IN_USE', status: 409 });
  }
  if (phone) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) throw Object.assign(new Error('Phone already in use.'), { code: 'PHONE_IN_USE', status: 409 });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRY_MINUTES * 60_000);

  // Atomically create User, StaffProfile, and ActivationToken
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      role: 'SCREENING_STAFF',
      status: 'PENDING_VERIFICATION',
      staffProfile: {
        create: { professionalName, designation, facilityId, employmentStatus }
      },
      activationTokens: {
        create: { tokenHash, expiresAt }
      }
    },
    include: { staffProfile: true }
  });

  const activationUrl = `${env.FRONTEND_URL}/activate?token=${rawToken}`;
  
  try {
    await emailProvider.sendAccountActivation(email, activationUrl);
  } catch (err) {
    // Honest failure strategy: rollback account creation if email fails
    await prisma.user.delete({ where: { id: user.id } });
    throw Object.assign(new Error('Failed to deliver activation email. Provisioning aborted.'), { code: 'EMAIL_DELIVERY_FAILED', status: 502 });
  }

  await prisma.auditLog.create({
    data: { event: 'STAFF_ACCOUNT_PROVISIONED', userId: adminId, ipAddress: ip, metadata: { provisionedUserId: user.id } }
  });

  await prisma.auditLog.create({
    data: { event: 'ACCOUNT_ACTIVATION_ISSUED', userId: user.id, ipAddress: ip }
  });

  return { id: user.id, staffProfileId: user.staffProfile?.id };
}

export async function provisionDoctor(adminId: string, input: ProvisionDoctorInput, ip: string) {
  const { professionalName, email, phone, specialty, registrationNumber, facilityId, authorizationStatus } = input;

  if (!emailProvider.isConfigured()) {
    throw Object.assign(new Error('Email service is not configured. Cannot provision accounts without activation capability.'), { status: 503 });
  }

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw Object.assign(new Error('Email already in use.'), { code: 'EMAIL_IN_USE', status: 409 });
  }
  if (phone) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) throw Object.assign(new Error('Phone already in use.'), { code: 'PHONE_IN_USE', status: 409 });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRY_MINUTES * 60_000);

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      role: 'DOCTOR',
      status: 'PENDING_VERIFICATION',
      doctorProfile: {
        create: { professionalName, specialty, registrationNumber, facilityId, authorizationStatus }
      },
      activationTokens: {
        create: { tokenHash, expiresAt }
      }
    },
    include: { doctorProfile: true }
  });

  const activationUrl = `${env.FRONTEND_URL}/activate?token=${rawToken}`;
  
  try {
    await emailProvider.sendAccountActivation(email, activationUrl);
  } catch (err) {
    await prisma.user.delete({ where: { id: user.id } });
    throw Object.assign(new Error('Failed to deliver activation email. Provisioning aborted.'), { code: 'EMAIL_DELIVERY_FAILED', status: 502 });
  }

  await prisma.auditLog.create({
    data: { event: 'DOCTOR_ACCOUNT_PROVISIONED', userId: adminId, ipAddress: ip, metadata: { provisionedUserId: user.id } }
  });

  await prisma.auditLog.create({
    data: { event: 'ACCOUNT_ACTIVATION_ISSUED', userId: user.id, ipAddress: ip }
  });

  return { id: user.id, doctorProfileId: user.doctorProfile?.id };
}

export async function getDashboardMetrics() {
  const [totalPatients, patientsToday, totalScreenings, screeningsAwaitingReview, reviewedScreenings, totalDoctors, totalStaff, totalFacilities] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
    prisma.screening.count(),
    prisma.screening.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.screening.count({ where: { status: 'COMPLETED', clinicalReview: { isNot: null } } }),
    prisma.doctorProfile.count(),
    prisma.staffProfile.count(),
    prisma.facility.count()
  ]);

  return {
    totalPatients,
    patientsRegisteredToday: patientsToday,
    totalScreenings,
    screeningsAwaitingReview,
    reviewedScreenings,
    totalDoctors,
    totalScreeningStaff: totalStaff,
    totalFacilities
  };
}

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, phone: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getDoctors() {
  return prisma.doctorProfile.findMany({
    include: { user: { select: { email: true, status: true, createdAt: true } }, facility: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getStaff() {
  return prisma.staffProfile.findMany({
    include: { user: { select: { email: true, status: true, createdAt: true } }, facility: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPatients() {
  return prisma.patient.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { include: { staffProfile: { include: { facility: true } } } },
      screenings: { orderBy: { createdAt: 'desc' }, take: 1, select: { status: true } },
      _count: { select: { screenings: true } }
    }
  });
}

export async function deletePatient(patientId: string) {
  // Soft delete patient transactionally
  return prisma.$transaction(async (tx) => {
    const patient = await tx.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new Error('Patient not found');
    
    return tx.patient.update({
      where: { id: patientId },
      data: { isActive: false }
    });
  });
}

export async function getScreenings() {
  return prisma.screening.findMany({
    include: { patient: true, initiatingStaff: { include: { staffProfile: true } }, clinicalReview: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getFacilities() {
  return prisma.facility.findMany({
    include: { _count: { select: { doctors: true, staff: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createFacility(data: { name: string; location?: string }) {
  return prisma.facility.create({ data });
}

export async function assignFacility(data: { userId: string; facilityId: string }) {
  const { userId, facilityId } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) throw Object.assign(new Error('Facility not found'), { status: 404 });

  if (user.role === 'DOCTOR') {
    return prisma.doctorProfile.update({
      where: { userId },
      data: { facilityId }
    });
  }

  if (user.role === 'SCREENING_STAFF') {
    return prisma.staffProfile.update({
      where: { userId },
      data: { facilityId }
    });
  }

  throw Object.assign(new Error('User is not a doctor or screening staff'), { status: 400 });
}
