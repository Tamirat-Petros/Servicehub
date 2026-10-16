import { AppError } from '../../common/AppError.js';
import { staffRepository } from './repository.js';

export const staffService = {
  list: (businessId) => staffRepository.list(businessId),
  create: (businessId, data) => staffRepository.create(businessId, data),
  async update(businessId, staffId, data) {
    const staff = await staffRepository.update(businessId, staffId, data);
    if (!staff) throw new AppError('Staff member not found', { statusCode: 404, code: 'STAFF_NOT_FOUND' });
    return staff;
  },
  async deactivate(businessId, staffId) {
    if (!(await staffRepository.deactivate(businessId, staffId))) {
      throw new AppError('Staff member not found', { statusCode: 404, code: 'STAFF_NOT_FOUND' });
    }
  },
  async setServices(businessId, staffId, serviceIds) {
    const result = await staffRepository.setServices(businessId, staffId, serviceIds);
    if (result.kind === 'staff-not-found') throw new AppError('Staff member not found', { statusCode: 404, code: 'STAFF_NOT_FOUND' });
    if (result.kind === 'invalid-services') throw new AppError('One or more active services do not belong to this business', { statusCode: 400, code: 'INVALID_SERVICE_ASSIGNMENT' });
    return { staffId, serviceIds };
  },
};
