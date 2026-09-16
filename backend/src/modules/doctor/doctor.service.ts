import { prisma } from '../../db/prisma';

export async function getDoctorProfile(userId: string) {
  return prisma.doctorProfile.findUnique({
    where: { userId },
    include: { facility: true, user: true }
  });
}

export async function getAuthorizedStaffUserIds(facilityId: string) {
  const staff = await prisma.staffProfile.findMany({
    where: { facilityId },
    select: { userId: true }
  });
  return staff.map(s => s.userId);
}

export async function getPendingReviews(userId: string) {
  const profile = await getDoctorProfile(userId);
  if (!profile || !profile.facilityId) return [];

  const staffUserIds = await getAuthorizedStaffUserIds(profile.facilityId);

  return prisma.screening.findMany({
    where: {
      initiatingStaffId: { in: staffUserIds },
      status: 'PENDING_REVIEW'
    },
    orderBy: { createdAt: 'desc' },
    include: {
      patient: true,
    }
  });
}

export async function getCompletedReviews(userId: string) {
  // Returns screenings reviewed by THIS doctor
  return prisma.screening.findMany({
    where: {
      status: 'COMPLETED',
      clinicalReview: {
        reviewerId: userId
      }
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      patient: true,
      clinicalReview: true,
      clinicalReport: true
    }
  });
}

export async function getScreeningDetails(userId: string, screeningId: string) {
  const profile = await getDoctorProfile(userId);
  if (!profile || !profile.facilityId) throw Object.assign(new Error('Unauthorized'), { status: 403 });

  const staffUserIds = await getAuthorizedStaffUserIds(profile.facilityId);

  const screening = await prisma.screening.findFirst({
    where: {
      id: screeningId,
      initiatingStaffId: { in: staffUserIds }
    },
    include: {
      patient: true,
      images: true,
      clinicalReview: true,
      clinicalReport: true
    }
  });

  if (!screening) throw Object.assign(new Error('Screening not found or unauthorized'), { status: 404 });
  return screening;
}

export async function getDashboardMetrics(userId: string) {
  const profile = await getDoctorProfile(userId);
  if (!profile || !profile.facilityId) {
    return { pendingReviews: 0, reviewedToday: 0, myPatients: 0, reportsGenerated: 0 };
  }

  const staffUserIds = await getAuthorizedStaffUserIds(profile.facilityId);

  const [pendingReviews, reviewedToday, myPatients, reportsGenerated] = await Promise.all([
    prisma.screening.count({
      where: { initiatingStaffId: { in: staffUserIds }, status: 'PENDING_REVIEW' }
    }),
    prisma.clinicalReview.count({
      where: {
        reviewerId: userId,
        reviewedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    }),
    prisma.patient.count({
      where: { createdByStaffId: { in: staffUserIds } }
    }),
    prisma.clinicalReport.count({
      where: { review: { reviewerId: userId } }
    })
  ]);

  return { pendingReviews, reviewedToday, myPatients, reportsGenerated };
}

export async function getPatients(userId: string) {
  const profile = await getDoctorProfile(userId);
  if (!profile || !profile.facilityId) return [];

  const staffUserIds = await getAuthorizedStaffUserIds(profile.facilityId);

  return prisma.patient.findMany({
    where: { createdByStaffId: { in: staffUserIds } },
    orderBy: { createdAt: 'desc' },
    include: {
      screenings: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { clinicalReview: true }
      }
    }
  });
}

export async function getReports(userId: string) {
  return prisma.clinicalReport.findMany({
    where: { review: { reviewerId: userId } },
    orderBy: { createdAt: 'desc' },
    include: {
      screening: {
        include: {
          patient: true
        }
      },
      review: true
    }
  });
}

export async function updateProfile(userId: string, data: any) {
  const { firstName, lastName, phone, professionalName, specialty, registrationNumber } = data;
  
  await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, phone }
  });

  return prisma.doctorProfile.upsert({
    where: { userId },
    update: { professionalName, specialty, registrationNumber },
    create: { userId, professionalName, specialty, registrationNumber }
  });
}

export async function search(userId: string, query: string) {
  const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
  if (!profile || !profile.facilityId) return { patients: [], screenings: [] };

  const q = query.trim();
  if (!q) return { patients: [], screenings: [] };

  const staffUserIds = await getAuthorizedStaffUserIds(profile.facilityId);

  const patients = await prisma.patient.findMany({
    where: {
      AND: [
        { createdByStaffId: { in: staffUserIds } },
        {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { id: { contains: q, mode: 'insensitive' } },
          ]
        }
      ]
    },
    take: 5,
    select: { id: true, firstName: true, lastName: true, gender: true, age: true }
  });

  const screenings = await prisma.screening.findMany({
    where: {
      AND: [
        { initiatingStaffId: { in: staffUserIds } },
        { id: { contains: q, mode: 'insensitive' } }
      ]
    },
    take: 5,
    select: { id: true, status: true, patient: { select: { firstName: true, lastName: true, id: true } } }
  });

  return { patients, screenings };
}
