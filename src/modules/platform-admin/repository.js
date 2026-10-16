import { prisma } from '../../database/prisma.js';
import { recordAuditLog } from '../../common/utils/index.js';

export const platformAdminRepository = {
  async getSummary() {
    const [businessCount, businessesByStatus, userCount, appointmentCount, confirmedAppointments] = await Promise.all([
      prisma.business.count(),
      prisma.business.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
    ]);
    return {
      totalBusinesses: businessCount,
      businessesByStatus: Object.fromEntries(businessesByStatus.map(({ status, _count }) => [status, _count._all])),
      activeUsers: userCount,
      totalAppointments: appointmentCount,
      confirmedAppointments,
    };
  },
  async listBusinesses({ cursor, limit }) {
    if (cursor) {
      const exists = await prisma.business.findUnique({ where: { id: cursor }, select: { id: true } });
      if (!exists) return null;
    }
    return prisma.business.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        timeZone: true,
        createdAt: true,
        _count: { select: { memberships: true, services: true, staff: true, appointments: true } },
      },
    });
  },
  updateBusinessStatus: ({ businessId, status, actorUserId }) => prisma.$transaction(async (tx) => {
    const business = await tx.business.findUnique({ where: { id: businessId }, select: { id: true, status: true } });
    if (!business) return null;
    if (business.status === status) return tx.business.findUnique({ where: { id: businessId } });
    const updated = await tx.business.update({ where: { id: businessId }, data: { status } });
    await recordAuditLog(tx, {
      businessId,
      actorUserId,
      action: 'BUSINESS_STATUS_CHANGED',
      entityType: 'Business',
      entityId: businessId,
      details: { from: business.status, to: status, source: 'PLATFORM_ADMIN' },
    });
    return updated;
  }),
};
