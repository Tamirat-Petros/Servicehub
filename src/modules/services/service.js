import { AppError } from '../../common/AppError.js';
import { servicesRepository } from './repository.js';

export const servicesService = {
  list: (businessId) => servicesRepository.list(businessId),
  create: (businessId, data) => servicesRepository.create(businessId, data),
  async update(businessId, serviceId, data) {
    const service = await servicesRepository.update(businessId, serviceId, data);
    if (!service) throw new AppError('Service not found', { statusCode: 404, code: 'SERVICE_NOT_FOUND' });
    return service;
  },
  async deactivate(businessId, serviceId) {
    if (!(await servicesRepository.deactivate(businessId, serviceId))) {
      throw new AppError('Service not found', { statusCode: 404, code: 'SERVICE_NOT_FOUND' });
    }
  },
};
