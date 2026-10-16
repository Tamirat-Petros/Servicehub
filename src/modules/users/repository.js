import { prisma } from '../../database/prisma.js';
import { recordAuditLog } from '../../common/utils/index.js';

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
  addMembership: ({ businessId, userId, role, actorUserId }) => prisma.$transaction(async (tx) => {
    const membership = await tx.membership.create({
      data: { businessId, userId, role },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
    await recordAuditLog(tx, {
      businessId,
      actorUserId,
      action: 'MEMBERSHIP_ADDED',
      entityType: 'Membership',
      entityId: membership.id,
      details: { userId, role },
    });
    return membership;
  }),
  removeMembership: ({ businessId, membershipId, actorUserId }) => prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findFirst({ where: { id: membershipId, businessId, role: { not: 'OWNER' } } });
    if (!membership) return { count: 0 };
    const result = await tx.membership.deleteMany({ where: { id: membershipId, businessId, role: { not: 'OWNER' } } });
    if (result.count > 0) {
      await recordAuditLog(tx, {
        businessId,
        actorUserId,
        action: 'MEMBERSHIP_REMOVED',
        entityType: 'Membership',
        entityId: membershipId,
        details: { userId: membership.userId, role: membership.role },
      });
    }
    return result;
  }),
};
