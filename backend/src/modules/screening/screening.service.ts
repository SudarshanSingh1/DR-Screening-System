import { prisma } from '../../db/prisma';

export async function createScreening(patientId: string, staffId: string) {
  // Validate patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: patientId }
  });

  if (!patient) {
    throw Object.assign(new Error('Patient not found'), { status: 404, code: 'PATIENT_NOT_FOUND' });
  }

  const screening = await prisma.screening.create({
    data: {
      patientId,
      initiatingStaffId: staffId,
      status: 'CREATED'
    }
  });

  await prisma.auditLog.create({
    data: {
      event: 'SCREENING_CREATED',
      userId: staffId, // User who initiated it
      metadata: { screeningId: screening.id, patientId: patient.id }
    }
  });

  return { id: screening.id };
}

export async function getScreeningsForStaff(staffId: string, limit: number, offset: number, status?: string) {
  // Assuming a Staff can see screenings they initiated, or based on facility.
  // The prompt states: "Use the strongest honest ownership boundaries supported by the current schema."
  // Without facility row-level security implemented yet, filtering by initiatingStaffId is the strongest honest boundary.
  
  const where: any = { initiatingStaffId: staffId };
  
  if (status === 'COMPLETED') {
    where.status = 'COMPLETED';
  } else if (status === 'IN_PROGRESS') {
    where.status = { notIn: ['COMPLETED', 'FAILED', 'CANCELLED'] };
  }

  const screenings = await prisma.screening.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gender: true,
          age: true
        }
      }
    }
  });

  return screenings.map(s => ({
    id: s.id,
    patientId: s.patient.id,
    patientName: `${s.patient.firstName} ${s.patient.lastName || ''}`.trim(),
    status: s.status,
    date: s.createdAt.toISOString()
  }));
}

export async function getScreeningDetails(screeningId: string, staffId: string) {
  const screening = await prisma.screening.findUnique({
    where: { id: screeningId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      initiatingStaffId: true,
      aiResult: true,
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gender: true,
          age: true
        }
      },
      images: {
        select: {
          id: true,
          eye: true,
          captureSequence: true,
          status: true,
          createdAt: true,
          storageKey: true
        }
      },
      clinicalReview: {
        include: { reviewer: { select: { doctorProfile: { select: { professionalName: true } } } } }
      },
      clinicalReport: true
    }
  });

  if (!screening) {
    throw Object.assign(new Error('Screening not found'), { status: 404, code: 'NOT_FOUND' });
  }

  if (screening.initiatingStaffId !== staffId) {
    throw Object.assign(new Error('Forbidden'), { status: 403, code: 'FORBIDDEN' });
  }

  return screening;
}

export async function cancelScreening(screeningId: string, staffId: string) {
  const screening = await prisma.screening.findUnique({
    where: { id: screeningId }
  });

  if (!screening) {
    throw Object.assign(new Error('Screening not found'), { status: 404, code: 'NOT_FOUND' });
  }

  if (screening.initiatingStaffId !== staffId) {
    throw Object.assign(new Error('Forbidden'), { status: 403, code: 'FORBIDDEN' });
  }

  if (screening.status === 'COMPLETED' || screening.status === 'CANCELLED') {
    throw Object.assign(new Error('Invalid status transition'), { status: 400, code: 'INVALID_STATUS_TRANSITION' });
  }

  const updated = await prisma.screening.update({
    where: { id: screeningId },
    data: { status: 'CANCELLED' }
  });

  await prisma.auditLog.create({
    data: {
      event: 'SCREENING_CANCELLED',
      userId: staffId,
      metadata: { screeningId: screening.id }
    }
  });

  return updated;
}
