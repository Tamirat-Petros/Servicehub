import { AppError } from '../../common/AppError.js';
import { notificationsRepository } from './repository.js';

export const notificationsService = {
  list: (userId, query) => notificationsRepository.listForUser({ userId, ...query }),
  async markRead(userId, notificationId) {
    const result = await notificationsRepository.markRead({ userId, notificationId });
    if (result.count === 0) throw new AppError('Notification not found', { statusCode: 404, code: 'NOTIFICATION_NOT_FOUND' });
  },
};
