/**
 * Idempotent account provisioning script.
 *
 * Provisions predefined SCREENING_STAFF, DOCTOR, and PATIENT accounts required
 * for SIH evaluation workflows.  Running this script multiple times is safe:
 * each account is looked up by email and created only if absent; existing
 * records are updated to the expected role and credentials.
 *
 * Run (inside the backend Docker container):
 *   npm run db:seed
 *
 * Passwords are hashed with bcrypt at 12 rounds before any database write.
 * No plaintext credential is persisted, logged, or returned.
 */

import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Must match BCRYPT_ROUNDS in auth.service.ts */
const BCRYPT_ROUNDS = 12;

// ─── Account Definitions ──────────────────────────────────────────────────────
// Passwords are consumed by bcrypt here and never written elsewhere.

interface StaffAccount {
  kind: 'staff';
  email: string;
  password: string;
  professionalName: string;
  designation: string;
}

interface DoctorAccount {
  kind: 'doctor';
  email: string;
  password: string;
  professionalName: string;
  specialty: string;
}

type AccountDefinition = StaffAccount | DoctorAccount;

const accounts: AccountDefinition[] = [
  // ── Screening Staff ──────────────────────────────────────────────────────
  {
    kind: 'staff',
    email: 'screening.staff1@visionai.health',
    password: 'Vision@Staff1#2026',
    professionalName: 'Screening Staff 1',
    designation: 'Screening Technician',
  },
  {
    kind: 'staff',
    email: 'screening.staff2@visionai.health',
    password: 'Vision@Staff2#2026',
    professionalName: 'Screening Staff 2',
    designation: 'Screening Technician',
  },
  {
    kind: 'staff',
    email: 'screening.staff3@visionai.health',
    password: 'Vision@Staff3#2026',
    professionalName: 'Screening Staff 3',
    designation: 'Screening Technician',
  },

  // ── Doctors ───────────────────────────────────────────────────────────────
  {
    kind: 'doctor',
    email: 'doctor1@visionai.health',
    password: 'Vision@Doctor1#2026',
    professionalName: 'Dr. Physician 1',
    specialty: 'Ophthalmology',
  },
  {
    kind: 'doctor',
    email: 'doctor2@visionai.health',
    password: 'Vision@Doctor2#2026',
    professionalName: 'Dr. Physician 2',
    specialty: 'Ophthalmology',
  },
  {
    kind: 'doctor',
    email: 'doctor3@visionai.health',
    password: 'Vision@Doctor3#2026',
    professionalName: 'Dr. Physician 3',
    specialty: 'Ophthalmology',
  },
];

// ─── Patient Account Definitions ──────────────────────────────────────────────

interface PatientAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
}

const patientAccounts: PatientAccount[] = [
  {
    email: 'patient1@visionai.health',
    password: 'Vision@Patient1#2026',
    firstName: 'Rahul',
    lastName: 'Kumar',
    age: 45,
    gender: 'Male',
  },
  {
    email: 'patient2@visionai.health',
    password: 'Vision@Patient2#2026',
    firstName: 'Priya',
    lastName: 'Sharma',
    age: 52,
    gender: 'Female',
  },
  {
    email: 'patient3@visionai.health',
    password: 'Vision@Patient3#2026',
    firstName: 'Arjun',
    lastName: 'Singh',
    age: 60,
    gender: 'Male',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function provisionAccount(account: AccountDefinition): Promise<void> {
  const { email, password } = account;
  const expectedRole = account.kind === 'staff' ? 'SCREENING_STAFF' : 'DOCTOR';

  // Hash the password before any database operation.
  // The plaintext is never stored, logged, or returned.
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { credential: true, staffProfile: true, doctorProfile: true },
  });

  if (!existing) {
    // ── New account ──────────────────────────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          emailVerified: true,
          role: expectedRole,
          status: 'ACTIVE',
        },
      });

      await tx.userCredential.create({
        data: {
          userId: user.id,
          credentialType: 'PASSWORD',
          passwordHash,
        },
      });

      if (account.kind === 'staff') {
        await tx.staffProfile.create({
          data: {
            userId: user.id,
            professionalName: account.professionalName,
            designation: account.designation,
            employmentStatus: 'ACTIVE',
          },
        });
      } else {
        await tx.doctorProfile.create({
          data: {
            userId: user.id,
            professionalName: account.professionalName,
            specialty: account.specialty,
            authorizationStatus: 'AUTHORIZED',
          },
        });
      }
    });

    console.log(`  [created]  ${email}  (${expectedRole})`);
    return;
  }

  // ── Existing account ───────────────────────────────────────────────────────
  // Safety check: never silently change an Admin or unexpected-role account.
  if (existing.role !== expectedRole) {
    console.warn(
      `  [skipped]  ${email} — role is ${existing.role}, expected ${expectedRole}. Manual review required.`,
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Refresh password hash and ensure account is active.
    await tx.userCredential.upsert({
      where: { userId: existing.id },
      update: { passwordHash, credentialType: 'PASSWORD' },
      create: {
        userId: existing.id,
        credentialType: 'PASSWORD',
        passwordHash,
      },
    });

    // Restore ACTIVE status only if the account is in PENDING_VERIFICATION.
    // Do not un-suspend a SUSPENDED account — that requires an admin decision.
    if (existing.status === 'PENDING_VERIFICATION') {
      await tx.user.update({
        where: { id: existing.id },
        data: { status: 'ACTIVE', emailVerified: true },
      });
    }

    // Ensure the domain profile exists (handles edge case where it was removed).
    if (account.kind === 'staff' && !existing.staffProfile) {
      await tx.staffProfile.create({
        data: {
          userId: existing.id,
          professionalName: account.professionalName,
          designation: account.designation,
          employmentStatus: 'ACTIVE',
        },
      });
    } else if (account.kind === 'doctor' && !existing.doctorProfile) {
      await tx.doctorProfile.create({
        data: {
          userId: existing.id,
          professionalName: account.professionalName,
          specialty: account.specialty,
          authorizationStatus: 'AUTHORIZED',
        },
      });
    }
  });

  console.log(`  [updated]  ${email}  (${expectedRole})`);
}

async function provisionPatientAccount(account: PatientAccount): Promise<void> {
  const { email, password } = account;

  // Hash the password before any database operation.
  // The plaintext is never stored, logged, or returned.
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { credential: true, patientProfile: true },
  });

  if (!existingUser) {
    // ── New patient account ──────────────────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          emailVerified: true,
          role: 'PATIENT',
          status: 'ACTIVE',
        },
      });

      await tx.userCredential.create({
        data: {
          userId: user.id,
          credentialType: 'PASSWORD',
          passwordHash,
        },
      });

      // Create the Patient profile record and link it to the User.
      // Mirrors the structure used by createPatientAndSendActivation in patient.service.ts.
      await tx.patient.create({
        data: {
          userId: user.id,
          firstName: account.firstName,
          lastName: account.lastName,
          email,
          age: account.age,
          gender: account.gender,
          isActive: true,
        },
      });
    });

    console.log(`  [created]  ${email}  (PATIENT)`);
    return;
  }

  // ── Existing patient account ───────────────────────────────────────────────
  // Safety check: never silently change an account with an unexpected role.
  if (existingUser.role !== 'PATIENT') {
    console.warn(
      `  [skipped]  ${email} — role is ${existingUser.role}, expected PATIENT. Manual review required.`,
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Refresh password hash and ensure account is active.
    await tx.userCredential.upsert({
      where: { userId: existingUser.id },
      update: { passwordHash, credentialType: 'PASSWORD' },
      create: {
        userId: existingUser.id,
        credentialType: 'PASSWORD',
        passwordHash,
      },
    });

    // Restore ACTIVE status only if the account is in PENDING_VERIFICATION.
    // Do not un-suspend a SUSPENDED account — that requires an admin decision.
    if (existingUser.status === 'PENDING_VERIFICATION') {
      await tx.user.update({
        where: { id: existingUser.id },
        data: { status: 'ACTIVE', emailVerified: true },
      });
    }

    // Ensure the Patient profile record exists and is linked to this User.
    if (!existingUser.patientProfile) {
      await tx.patient.create({
        data: {
          userId: existingUser.id,
          firstName: account.firstName,
          lastName: account.lastName,
          email,
          age: account.age,
          gender: account.gender,
          isActive: true,
        },
      });
    }
  });

  console.log(`  [updated]  ${email}  (PATIENT)`);
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Provisioning predefined accounts…\n');

  for (const account of accounts) {
    await provisionAccount(account);
  }

  for (const account of patientAccounts) {
    await provisionPatientAccount(account);
  }

  console.log('\nProvisioning complete.');
}

main()
  .catch((err) => {
    console.error('Provisioning failed:', err.message ?? err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
