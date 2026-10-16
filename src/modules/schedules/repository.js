import { prisma } from '../../database/prisma.js';

export const schedulesRepository = {
  list: ({ businessId, staffId }) => prisma.staffSchedule.findMany({
    where: { businessId, ...(staffId ? { staffId } : {}) },
    orderBy: [{ staffId: 'asc' }, { weekday: 'asc' }, { startMinute: 'asc' }],
  }),
  replace: ({ businessId, staffId, intervals }) => prisma.$transaction(async (tx) => {
    const staff = await tx.staffMember.findFirst({ where: { id: staffId, businessId, isActive: true }, select: { id: true } });
    if (!staff) return null;
    await tx.staffSchedule.deleteMany({ where: { businessId, staffId } });
    if (intervals.length > 0) {
      await tx.staffSchedule.createMany({ data: intervals.map((interval) => ({ ...interval, businessId, staffId })) });
    }
    return tx.staffSchedule.findMany({
      where: { businessId, staffId },
      orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }],
    });
  }),
};
