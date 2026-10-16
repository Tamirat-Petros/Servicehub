import { prisma } from '../../database/prisma.js';

export const notificationsRepository = {
  listForUser: ({ userId, unreadOnly, limit }) => prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { readAt: null } : {}) },
    select: { id: true, type: true, title: true, body: true, data: true, readAt: true, createdAt: true, business: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  }),
  markRead: ({ userId, notificationId }) => prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  }),
};
