import { prisma } from '../../database/prisma.js';
import { recordAuditLog } from '../../common/utils/index.js';

export const staffRepository = {
  list: (businessId) => prisma.staffMember.findMany({
    where: { businessId },
    include: { serviceAssignments: { include: { service: { select: { id: true, name: true, durationMinutes: true } } } } },
    orderBy: { displayName: 'asc' },
  }),
  create: (businessId, data, actorUserId) => prisma.$transaction(async (tx) => {
    const staff = await tx.staffMember.create({ data: { ...data, businessId } });
    await recordAuditLog(tx, { businessId, actorUserId, action: 'STAFF_CREATED', entityType: 'StaffMember', entityId: staff.id, details: { displayName: staff.displayName } });
    return staff;
  }),
  update: (businessId, staffId, data, actorUserId) => prisma.$transaction(async (tx) => {
    const result = await tx.staffMember.updateMany({ where: { id: staffId, businessId }, data });
    if (result.count === 0) return null;
    const staff = await tx.staffMember.findFirst({ where: { id: staffId, businessId } });
    await recordAuditLog(tx, { businessId, actorUserId, action: 'STAFF_UPDATED', entityType: 'StaffMember', entityId: staffId, details: { fields: Object.keys(data) } });
    return staff;
  }),
  deactivate: (businessId, staffId, actorUserId) => prisma.$transaction(async (tx) => {
    const result = await tx.staffMember.updateMany({ where: { id: staffId, businessId }, data: { isActive: false } });
    if (result.count > 0) await recordAuditLog(tx, { businessId, actorUserId, action: 'STAFF_DEACTIVATED', entityType: 'StaffMember', entityId: staffId, details: {} });
    return result.count > 0;
  }),
  setServices: async (businessId, staffId, serviceIds, actorUserId) => prisma.$transaction(async (tx) => {
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
    await recordAuditLog(tx, { businessId, actorUserId, action: 'STAFF_SERVICES_UPDATED', entityType: 'StaffMember', entityId: staffId, details: { serviceIds } });
    return { kind: 'updated' };
  }),
};
