import { prisma } from '../../database/prisma.js';

export const staffRepository = {
  list: (businessId) => prisma.staffMember.findMany({
    where: { businessId },
    include: { serviceAssignments: { include: { service: { select: { id: true, name: true, durationMinutes: true } } } } },
    orderBy: { displayName: 'asc' },
  }),
  create: (businessId, data) => prisma.staffMember.create({ data: { ...data, businessId } }),
  update: async (businessId, staffId, data) => {
    const result = await prisma.staffMember.updateMany({ where: { id: staffId, businessId }, data });
    if (result.count === 0) return null;
    return prisma.staffMember.findFirst({ where: { id: staffId, businessId } });
  },
  deactivate: async (businessId, staffId) => {
    const result = await prisma.staffMember.updateMany({ where: { id: staffId, businessId }, data: { isActive: false } });
    return result.count > 0;
  },
  setServices: async (businessId, staffId, serviceIds) => prisma.$transaction(async (tx) => {
    const staff = await tx.staffMember.findFirst({ where: { id: staffId, businessId }, select: { id: true } });
    if (!staff) return { kind: 'staff-not-found' };

    const services = await tx.service.findMany({
      where: { businessId, id: { in: serviceIds }, isActive: true },
      select: { id: true },
    });
    if (services.length !== serviceIds.length) return { kind: 'invalid-services' };

    await tx.staffService.deleteMany({ where: { businessId, staffId } });
    if (serviceIds.length > 0) {
      await tx.staffService.createMany({ data: serviceIds.map((serviceId) => ({ businessId, staffId, serviceId })) });
    }
    return { kind: 'updated' };
  }),
};
