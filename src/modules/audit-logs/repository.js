import { prisma } from '../../database/prisma.js';

export const auditLogsRepository = {
  list: async ({ businessId, cursor, limit }) => {
    if (cursor) {
      const exists = await prisma.auditLog.findFirst({ where: { id: cursor, businessId }, select: { id: true } });
      if (!exists) return null;
    }
    return prisma.auditLog.findMany({
      where: { businessId },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        details: true,
        createdAt: true,
        actor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },
};
