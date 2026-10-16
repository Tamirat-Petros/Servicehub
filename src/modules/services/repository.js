import { prisma } from '../../database/prisma.js';
import { recordAuditLog } from '../../common/utils/index.js';

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
  create: (businessId, data, actorUserId) => prisma.$transaction(async (tx) => {
    const service = await tx.service.create({ data: { ...data, businessId, price: data.price, currency: data.currency ?? 'KES' } });
    await recordAuditLog(tx, { businessId, actorUserId, action: 'SERVICE_CREATED', entityType: 'Service', entityId: service.id, details: { name: service.name } });
    return service;
  }),
  update: (businessId, serviceId, data, actorUserId) => prisma.$transaction(async (tx) => {
    const result = await tx.service.updateMany({ where: { id: serviceId, businessId }, data });
    if (result.count === 0) return null;
    const service = await tx.service.findFirst({ where: { id: serviceId, businessId } });
    await recordAuditLog(tx, { businessId, actorUserId, action: 'SERVICE_UPDATED', entityType: 'Service', entityId: serviceId, details: { fields: Object.keys(data) } });
    return service;
  }),
  deactivate: (businessId, serviceId, actorUserId) => prisma.$transaction(async (tx) => {
    const result = await tx.service.updateMany({ where: { id: serviceId, businessId }, data: { isActive: false } });
    if (result.count > 0) await recordAuditLog(tx, { businessId, actorUserId, action: 'SERVICE_DEACTIVATED', entityType: 'Service', entityId: serviceId, details: {} });
    return result.count > 0;
  }),
};
