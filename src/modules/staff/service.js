import { AppError } from '../../common/AppError.js';
import { staffRepository } from './repository.js';

export const staffService = {
  list: (businessId) => staffRepository.list(businessId),
  create: (businessId, data, actorUserId) => staffRepository.create(businessId, data, actorUserId),
  async update(businessId, staffId, data, actorUserId) {
    const staff = await staffRepository.update(businessId, staffId, data, actorUserId);
    if (!staff) throw new AppError('Staff member not found', { statusCode: 404, code: 'STAFF_NOT_FOUND' });
    return staff;
  },
  async deactivate(businessId, staffId, actorUserId) {
    if (!(await staffRepository.deactivate(businessId, staffId, actorUserId))) {
      throw new AppError('Staff member not found', { statusCode: 404, code: 'STAFF_NOT_FOUND' });
    }
  },
  async setServices(businessId, staffId, serviceIds, actorUserId) {
    const result = await staffRepository.setServices(businessId, staffId, serviceIds, actorUserId);
    if (result.kind === 'staff-not-found') throw new AppError('Staff member not found', { statusCode: 404, code: 'STAFF_NOT_FOUND' });
    if (result.kind === 'invalid-services') throw new AppError('One or more active services do not belong to this business', { statusCode: 400, code: 'INVALID_SERVICE_ASSIGNMENT' });
    return { staffId, serviceIds };
  },
};
