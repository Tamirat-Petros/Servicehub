import { AppError } from '../../common/AppError.js';
import { schedulesRepository } from './repository.js';

export const schedulesService = {
  list: (businessId, staffId) => schedulesRepository.list({ businessId, staffId }),
  async replace(businessId, staffId, intervals, actorUserId) {
    const schedule = await schedulesRepository.replace({ businessId, staffId, intervals, actorUserId });
    if (!schedule) throw new AppError('Staff member not found', { statusCode: 404, code: 'STAFF_NOT_FOUND' });
    return schedule;
  },
};
