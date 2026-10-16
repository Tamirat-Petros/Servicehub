import { prisma } from '../../database/prisma.js';
import { createInAppNotifications, recordAuditLog } from '../../common/utils/index.js';

const appointmentSelect = {
  id: true,
  businessId: true,
  serviceId: true,
  staffId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  startsAt: true,
  endsAt: true,
  status: true,
  notes: true,
  createdAt: true,
  service: { select: { name: true, durationMinutes: true, price: true, currency: true } },
  staff: { select: { displayName: true } },
};

function listFilter({ businessId, from, to, staffId }) {
  return {
    businessId,
    ...(staffId ? { staffId } : {}),
    ...(from || to ? { startsAt: { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } } : {}),
  };
}

const weekdayNumber = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function localDateTime(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    dayKey: `${values.year}-${values.month}-${values.day}`,
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    weekday: weekdayNumber[values.weekday],
    minute: Number(values.hour) * 60 + Number(values.minute),
    second: Number(values.second),
  };
}

function localMinuteToUtc(dateText, minute, timeZone) {
  const [year, month, day] = dateText.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day, Math.floor(minute / 60), minute % 60);
  let candidate = target;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const local = localDateTime(new Date(candidate), timeZone);
    const represented = Date.UTC(local.year, local.month - 1, local.day, Math.floor(local.minute / 60), local.minute % 60);
    const difference = target - represented;
    if (difference === 0) return new Date(candidate);
    candidate += difference;
  }
  return null;
}

export const appointmentsRepository = {
  findPublicAvailability: async ({ businessSlug, serviceId, date, staffId }) => {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, isActive: true, business: { slug: businessSlug, status: 'ACTIVE' } },
      select: {
        id: true,
        businessId: true,
        durationMinutes: true,
        business: { select: { timeZone: true } },
      },
    });
    if (!service) return null;

    const [year, month, day] = date.split('-').map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (parsedDate.getUTCFullYear() !== year || parsedDate.getUTCMonth() + 1 !== month || parsedDate.getUTCDate() !== day) return [];
    const weekday = parsedDate.getUTCDay();
    const dayStart = localMinuteToUtc(date, 0, service.business.timeZone);
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
    const dayEnd = localMinuteToUtc(nextDate, 0, service.business.timeZone);
    if (!dayStart || !dayEnd) return [];

    const assignments = await prisma.staffService.findMany({
      where: {
        businessId: service.businessId,
        serviceId,
        ...(staffId ? { staffId } : {}),
        staff: { isActive: true },
      },
      select: {
        staff: {
          select: {
            id: true,
            displayName: true,
            schedules: { where: { weekday }, select: { startMinute: true, endMinute: true } },
          },
        },
      },
    });
    const staffIds = assignments.map(({ staff }) => staff.id);
    if (staffIds.length === 0) return [];

    const existing = await prisma.appointment.findMany({
      where: {
        businessId: service.businessId,
        staffId: { in: staffIds },
        status: { not: 'CANCELLED' },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
      select: { staffId: true, startsAt: true, endsAt: true },
    });

    const slots = [];
    for (const { staff } of assignments) {
      for (const interval of staff.schedules) {
        for (let startMinute = interval.startMinute; startMinute + service.durationMinutes <= interval.endMinute; startMinute += 15) {
          const startsAt = localMinuteToUtc(date, startMinute, service.business.timeZone);
          if (!startsAt || startsAt <= new Date()) continue;
          const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
          const localEnd = localDateTime(endsAt, service.business.timeZone);
          if (localEnd.dayKey !== date || localEnd.minute !== startMinute + service.durationMinutes) continue;
          const occupied = existing.some((item) => item.staffId === staff.id && item.startsAt < endsAt && item.endsAt > startsAt);
          if (!occupied) slots.push({ staffId: staff.id, staffName: staff.displayName, startsAt, endsAt });
        }
      }
    }
    return slots.sort((a, b) => a.startsAt - b.startsAt || a.staffName.localeCompare(b.staffName));
  },
  book: ({ businessSlug, input }) => prisma.$transaction(async (tx) => {
    const business = await tx.business.findFirst({
      where: { slug: businessSlug, status: 'ACTIVE' },
      select: { id: true, timeZone: true },
    });
    if (!business) return { kind: 'business-not-found' };

    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${business.id}:${input.staffId}`}, 0))`;

    const staff = await tx.staffMember.findFirst({
      where: { id: input.staffId, businessId: business.id, isActive: true },
      select: { id: true },
    });
    if (!staff) return { kind: 'staff-not-found' };

    const service = await tx.service.findFirst({
      where: {
        id: input.serviceId,
        businessId: business.id,
        isActive: true,
        staffAssignments: { some: { businessId: business.id, staffId: staff.id } },
      },
      select: { id: true, durationMinutes: true },
    });
    if (!service) return { kind: 'service-not-assigned' };

    const startsAt = input.startsAt;
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
    const localStart = localDateTime(startsAt, business.timeZone);
    const localEnd = localDateTime(endsAt, business.timeZone);
    if (startsAt <= new Date() || startsAt.getUTCSeconds() !== 0 || startsAt.getUTCMilliseconds() !== 0) {
      return { kind: 'invalid-start-time' };
    }
    if (localStart.dayKey !== localEnd.dayKey || localStart.second !== 0 || localEnd.second !== 0) {
      return { kind: 'outside-business-hours' };
    }

    const schedule = await tx.staffSchedule.findFirst({
      where: {
        businessId: business.id,
        staffId: staff.id,
        weekday: localStart.weekday,
        startMinute: { lte: localStart.minute },
        endMinute: { gte: localEnd.minute },
      },
      select: { id: true },
    });
    if (!schedule) return { kind: 'outside-business-hours' };

    const conflict = await tx.appointment.findFirst({
      where: {
        businessId: business.id,
        staffId: staff.id,
        status: { not: 'CANCELLED' },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
    });
    if (conflict) return { kind: 'slot-taken' };

    const appointment = await tx.appointment.create({
      data: {
        businessId: business.id,
        serviceId: service.id,
        staffId: staff.id,
        customerUserId: input.customerUserId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        startsAt,
        endsAt,
        notes: input.notes,
      },
      select: appointmentSelect,
    });

    const managers = await tx.membership.findMany({
      where: { businessId: business.id, role: { in: ['OWNER', 'ADMIN'] }, user: { status: 'ACTIVE' } },
      select: { userId: true },
    });
    const recipients = new Map();
    if (input.customerUserId) {
      recipients.set(input.customerUserId, {
        businessId: business.id,
        userId: input.customerUserId,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Appointment confirmed',
        body: 'Your appointment is confirmed.',
        data: { appointmentId: appointment.id },
      });
    }
    for (const { userId } of managers) {
      if (!recipients.has(userId)) {
        recipients.set(userId, {
          businessId: business.id,
          userId,
          type: 'APPOINTMENT_CREATED',
          title: 'New appointment booked',
          body: 'A customer booked an appointment.',
          data: { appointmentId: appointment.id },
        });
      }
    }
    await createInAppNotifications(tx, [...recipients.values()]);
    await recordAuditLog(tx, {
      businessId: business.id,
      actorUserId: input.customerUserId,
      action: 'APPOINTMENT_BOOKED',
      entityType: 'Appointment',
      entityId: appointment.id,
      details: { serviceId: service.id, staffId: staff.id, startsAt: startsAt.toISOString() },
    });
    return { kind: 'booked', appointment };
  }),

  list: async ({ businessId, from, to, staffId, cursor, limit }) => {
    const where = listFilter({ businessId, from, to, staffId });
    if (cursor) {
      const cursorExists = await prisma.appointment.findFirst({ where: { ...where, id: cursor }, select: { id: true } });
      if (!cursorExists) return null;
    }
    return prisma.appointment.findMany({
      where,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
      select: appointmentSelect,
    });
  },

  updateStatus: async ({ businessId, appointmentId, status, actorUserId }) => prisma.$transaction(async (tx) => {
    const current = await tx.appointment.findFirst({
      where: { id: appointmentId, businessId },
      select: { id: true, status: true, customerUserId: true },
    });
    if (!current) return { kind: 'not-found' };
    if (current.status === status) {
      const appointment = await tx.appointment.findFirst({ where: { id: appointmentId, businessId }, select: appointmentSelect });
      return { kind: 'updated', appointment };
    }
    if (current.status !== 'CONFIRMED') return { kind: 'invalid-transition' };

    const result = await tx.appointment.updateMany({
      where: { id: appointmentId, businessId, status: 'CONFIRMED' },
      data: { status },
    });
    if (result.count === 0) return { kind: 'invalid-transition' };
    const appointment = await tx.appointment.findFirst({ where: { id: appointmentId, businessId }, select: appointmentSelect });
    const managers = await tx.membership.findMany({
      where: { businessId, role: { in: ['OWNER', 'ADMIN'] }, user: { status: 'ACTIVE' } },
      select: { userId: true },
    });
    const title = status === 'CANCELLED' ? 'Appointment cancelled' : 'Appointment completed';
    const body = status === 'CANCELLED' ? 'An appointment was cancelled.' : 'Your appointment was marked complete.';
    const recipients = new Set([current.customerUserId, ...managers.map(({ userId }) => userId)].filter(Boolean));
    await createInAppNotifications(tx, [...recipients].map((userId) => ({
      businessId,
      userId,
      type: `APPOINTMENT_${status}`,
      title,
      body,
      data: { appointmentId },
    })));
    await recordAuditLog(tx, {
      businessId,
      actorUserId,
      action: `APPOINTMENT_${status}`,
      entityType: 'Appointment',
      entityId: appointmentId,
      details: {},
    });
    return { kind: 'updated', appointment };
  }),
};
