import { prisma } from '../../database/prisma.js';

export const servicesRepository = {
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
