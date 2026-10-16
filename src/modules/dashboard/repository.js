import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.js';

function localDateParts(date, timeZone) {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function localMidnightToUtc(dateKey, timeZone) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  let candidate = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const local = localDateParts(new Date(candidate), timeZone);
    const represented = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
    const difference = target - represented;
    if (difference === 0) return new Date(candidate);
    candidate += difference;
  }
  return null;
}

function todayRange(timeZone) {
  const local = localDateParts(new Date(), timeZone);
  const today = `${local.year}-${String(local.month).padStart(2, '0')}-${String(local.day).padStart(2, '0')}`;
  const tomorrow = new Date(Date.UTC(local.year, local.month - 1, local.day + 1)).toISOString().slice(0, 10);
  return { from: localMidnightToUtc(today, timeZone), to: localMidnightToUtc(tomorrow, timeZone) };
}

export const dashboardRepository = {
  async getSummary({ businessId, timeZone, includeRevenue }) {
    const { from, to } = todayRange(timeZone);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60_000);
    const [byStatus, todayCount, upcomingCount, serviceCount, staffCount, completedToday] = await Promise.all([
      prisma.appointment.groupBy({ by: ['status'], where: { businessId }, _count: { _all: true } }),
      prisma.appointment.count({ where: { businessId, startsAt: { gte: from, lt: to } } }),
      prisma.appointment.count({ where: { businessId, status: 'CONFIRMED', startsAt: { gte: now, lt: nextWeek } } }),
      prisma.service.count({ where: { businessId, isActive: true } }),
      prisma.staffMember.count({ where: { businessId, isActive: true } }),
      includeRevenue
        ? prisma.appointment.findMany({
          where: { businessId, status: 'COMPLETED', startsAt: { gte: from, lt: to } },
          select: { service: { select: { price: true, currency: true } } },
        })
        : Promise.resolve(null),
    ]);
    const revenueByCurrency = completedToday === null ? null : completedToday.reduce((totals, appointment) => {
      const { price, currency } = appointment.service;
      totals[currency] = (totals[currency] ?? new Prisma.Decimal(0)).plus(price);
      return totals;
    }, {});

    return {
      appointmentsByStatus: Object.fromEntries(byStatus.map(({ status, _count }) => [status, _count._all])),
      todayAppointments: todayCount,
      upcomingAppointmentsNext7Days: upcomingCount,
      activeServices: serviceCount,
      activeStaff: staffCount,
      completedRevenueTodayByCurrency: revenueByCurrency && Object.fromEntries(
        Object.entries(revenueByCurrency).map(([currency, amount]) => [currency, amount.toFixed(2)]),
      ),
    };
  },
};
