import { AppError } from '../../common/AppError.js';
import { servicesRepository } from './repository.js';

export const servicesService = {
  publicCatalog: (businessSlug) => servicesRepository.findPublicCatalog(businessSlug),
  list: (businessId) => servicesRepository.list(businessId),
  create: (businessId, data, actorUserId) => servicesRepository.create(businessId, data, actorUserId),
  async update(businessId, serviceId, data, actorUserId) {
    const service = await servicesRepository.update(businessId, serviceId, data, actorUserId);
    if (!service) throw new AppError('Service not found', { statusCode: 404, code: 'SERVICE_NOT_FOUND' });
    return service;
  },
  async deactivate(businessId, serviceId, actorUserId) {
    if (!(await servicesRepository.deactivate(businessId, serviceId, actorUserId))) {
      throw new AppError('Service not found', { statusCode: 404, code: 'SERVICE_NOT_FOUND' });
    }
  },
};
