import { prisma } from '../../db/prisma';

export async function getPatientScreenings(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return [];

  return prisma.screening.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' },
    include: {
      clinicalReview: {
        include: {
          reviewer: { select: { doctorProfile: { select: { professionalName: true } } } }
        }
      },
      clinicalReport: true
    }
  });
}

export async function getScreeningDetails(userId: string, screeningId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw Object.assign(new Error('Patient not found'), { status: 404 });

  const screening = await prisma.screening.findFirst({
    where: {
      id: screeningId,
      patientId: patient.id
    },
    include: {
      images: true,
      clinicalReview: {
        include: {
          reviewer: { select: { doctorProfile: { select: { professionalName: true } } } }
        }
      },
      clinicalReport: true,
      patient: true
    }
  });

  if (!screening) throw Object.assign(new Error('Screening not found'), { status: 404 });
  return screening;
}
