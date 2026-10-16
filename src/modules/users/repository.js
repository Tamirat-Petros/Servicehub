import { prisma } from '../../database/prisma.js';

export const usersRepository = {
  listBusinessMembers: (businessId) => prisma.membership.findMany({
    where: { businessId },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } },
    },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  }),
  findUserByEmail: (email) => prisma.user.findFirst({ where: { email, status: 'ACTIVE' }, select: { id: true } }),
  addMembership: ({ businessId, userId, role }) => prisma.membership.create({
    data: { businessId, userId, role },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  }),
  removeMembership: ({ businessId, membershipId }) => prisma.membership.deleteMany({ where: { id: membershipId, businessId, role: { not: 'OWNER' } } }),
};
