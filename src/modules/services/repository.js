import { prisma } from '../../database/prisma.js';

export const servicesRepository = {
  findPublicCatalog: (businessSlug) => prisma.business.findFirst({
    where: { slug: businessSlug, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      slug: true,
      timeZone: true,
      services: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          durationMinutes: true,
          price: true,
          currency: true,
          staffAssignments: {
            where: { staff: { isActive: true } },
            select: { staff: { select: { id: true, displayName: true } } },
          },
        },
      },
    },
  }),
  list: (businessId) => prisma.service.findMany({
    where: { businessId },
    orderBy: { name: 'asc' },
  }),
  create: (businessId, data) => prisma.service.create({ data: { ...data, businessId, price: data.price, currency: data.currency ?? 'KES' } }),
  update: async (businessId, serviceId, data) => {
    const result = await prisma.service.updateMany({ where: { id: serviceId, businessId }, data });
    if (result.count === 0) return null;
    return prisma.service.findFirst({ where: { id: serviceId, businessId } });
  },
  deactivate: async (businessId, serviceId) => {
    const result = await prisma.service.updateMany({ where: { id: serviceId, businessId }, data: { isActive: false } });
    return result.count > 0;
  },
};
