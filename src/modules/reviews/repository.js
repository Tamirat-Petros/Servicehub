import { prisma } from '../../database/prisma.js';
import { recordAuditLog } from '../../common/utils/index.js';

export const reviewsRepository = {
  listPublic: ({ businessSlug, limit }) => prisma.review.findMany({
    where: { business: { slug: businessSlug, status: 'ACTIVE' } },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      customer: { select: { firstName: true } },
      appointment: { select: { service: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  }),
  createForCompletedAppointment: ({ businessSlug, appointmentId, customerUserId, rating, comment }) => prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({
      where: {
        id: appointmentId,
        customerUserId,
        status: 'COMPLETED',
        business: { slug: businessSlug, status: 'ACTIVE' },
      },
      select: { id: true, businessId: true },
    });
    if (!appointment) return null;
    const review = await tx.review.create({
      data: { businessId: appointment.businessId, appointmentId: appointment.id, customerUserId, rating, comment },
      select: { id: true, rating: true, comment: true, createdAt: true },
    });
    await recordAuditLog(tx, {
      businessId: appointment.businessId,
      actorUserId: customerUserId,
      action: 'REVIEW_CREATED',
      entityType: 'Review',
      entityId: review.id,
      details: { appointmentId, rating },
    });
    return review;
  }),
};
