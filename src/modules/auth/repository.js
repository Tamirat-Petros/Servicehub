import { prisma } from '../../database/prisma.js';

export const authRepository = {
  findUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  findUserById: (id) => prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          business: { select: { id: true, name: true, slug: true, status: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  }),
  createAccount: ({ email, passwordHash, firstName, lastName, businessName, slug }) => prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email, passwordHash, firstName, lastName } });
    const business = await tx.business.create({ data: { name: businessName, slug } });
    await tx.membership.create({ data: { userId: user.id, businessId: business.id, role: 'OWNER' } });
    return { user, business };
  }),
};
