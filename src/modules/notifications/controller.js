import { notificationsService } from './service.js';

export const notificationsController = {
  list: async (req, res) => res.status(200).json({ data: await notificationsService.list(req.auth.userId, req.validatedQuery) }),
  markRead: async (req, res) => {
    await notificationsService.markRead(req.auth.userId, req.params.notificationId);
    res.status(204).end();
  },
};
