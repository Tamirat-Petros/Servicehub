import { prisma } from '../../database/prisma.js';

export const businessesRepository = {
  findMemberships: ({ userId, businessId }) => prisma.membership.findMany({
    where: { userId, ...(businessId ? { businessId } : {}), business: { status: 'ACTIVE' } },
    select: {
      businessId: true,
      role: true,
      business: { select: { id: true, name: true, slug: true, status: true, timeZone: true, createdAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  }),
};
