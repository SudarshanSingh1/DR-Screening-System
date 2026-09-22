import { prisma } from '../../db/prisma';

export async function getStaffProfile(userId: string) {
  const profile = await prisma.staffProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      professionalName: true,
      designation: true,
      employmentStatus: true,
      facilityId: true,
      facility: {
        select: {
          name: true
        }
      },
      user: {
        select: {
          role: true,
          status: true,
          email: true,
          phone: true,
        }
      }
    }
  });

  if (!profile) {
    throw Object.assign(new Error('Staff profile not found'), { status: 404 });
  }

  return {
    id: profile.id,
    professionalName: profile.professionalName,
    designation: profile.designation,
    employmentStatus: profile.employmentStatus,
    facilityId: profile.facilityId,
    facilityName: profile.facility?.name || 'Unassigned',
    role: profile.user.role,
    status: profile.user.status,
    email: profile.user.email,
    phone: profile.user.phone,
  };
}

export async function searchPatients(query: string = '') {
  if (!query || !query.trim()) {
    return await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        gender: true,
        phone: true,
        email: true,
        aadhaarReference: true
      }
    });
  }

  // Support multi-word name searches (e.g. "First Last")
  const terms = query.trim().split(/\s+/).filter(Boolean);
  
  const nameConditions = terms.length > 0 ? {
    AND: terms.map(term => ({
      OR: [
        { firstName: { contains: term, mode: 'insensitive' as const } },
        { lastName: { contains: term, mode: 'insensitive' as const } }
      ]
    }))
  } : {};

  // Scope patient search to safe basic identifiers
  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { id: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { email: { contains: query, mode: 'insensitive' } },
        { aadhaarReference: { equals: query } }, // Exact match only for Aadhaar ref
        ...(terms.length > 0 ? [nameConditions] : [])
      ]
    },
    take: 20, // Bounded results
    select: {
      id: true,
      firstName: true,
      lastName: true,
      age: true,
      gender: true,
      phone: true, // Safe contact info
    }
  });

  return patients;
}

export async function getDashboardMetrics(staffId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [patientsRegisteredToday, screeningsInProgress, screeningsCompleted, actionableScreenings] = await Promise.all([
    prisma.patient.count({
      where: { 
        createdByStaffId: staffId,
        createdAt: { gte: startOfDay }
      }
    }),
    prisma.screening.count({
      where: { 
        initiatingStaffId: staffId,
        status: { notIn: ['COMPLETED', 'FAILED', 'CANCELLED'] }
      }
    }),
    prisma.screening.count({
      where: { 
        initiatingStaffId: staffId,
        status: 'COMPLETED'
      }
    }),
    prisma.screening.findMany({
      where: {
        initiatingStaffId: staffId,
        status: { notIn: ['COMPLETED', 'FAILED', 'CANCELLED'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        patient: { select: { firstName: true, lastName: true } }
      }
    })
  ]);

  const workQueue = actionableScreenings.map(s => ({
    id: s.id,
    title: `Screening for ${s.patient.firstName} ${s.patient.lastName || ''}`.trim(),
    description: `Created on ${s.createdAt.toLocaleDateString()} - Status: ${s.status.replace(/_/g, ' ')}`,
    action: 'Review',
    path: `/staff/screenings/${s.id}/result`
  }));

  return {
    patientsRegisteredToday,
    screeningsInProgress,
    screeningsCompleted,
    workQueue
  };
}

export async function getPatientDetails(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      age: true,
      gender: true,
      phone: true,
      email: true,
      preferredLanguage: true,
      createdAt: true,
      createdByStaffId: true
    }
  });

  if (!patient) {
    throw Object.assign(new Error('Patient not found'), { status: 404, code: 'PATIENT_NOT_FOUND' });
  }

  return patient;
}

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { emailProvider } from '../../providers/email/nodemailer.provider';
import { env } from '../../config/env';
import type { CreatePatientInput } from './staff.schema';

const BCRYPT_ROUNDS = 12;
const ACTIVATION_TOKEN_EXPIRY_MINUTES = 24 * 60;

export async function createPatient(staffId: string, data: CreatePatientInput, ip: string) {
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
      age: data.age,
      gender: data.gender,
      aadhaarReference: data.aadhaarReference,
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
    // Optionally log or silently fail if SMTP isn't setup for patient creation
    try {
      await emailProvider.sendAccountActivation(data.email, activationUrl);
    } catch (e) {
      console.warn('Could not send patient activation email:', e);
    }
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

export async function getFacilities() {
  return prisma.facility.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true, location: true }
  });
}

export async function getDoctors() {
  return prisma.doctorProfile.findMany({
    include: { facility: true }
  });
}
