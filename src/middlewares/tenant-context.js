import { AppError } from '../common/AppError.js';
import { businessesRepository } from '../modules/businesses/repository.js';

export async function tenantContext(req, _res, next) {
  if (!req.auth?.userId) {
    return next(new AppError('Authentication is required before tenant selection', { statusCode: 401, code: 'UNAUTHENTICATED' }));
  }

  const requestedBusinessId = req.get('x-business-id');
  const memberships = await businessesRepository.findMemberships({ userId: req.auth.userId, businessId: requestedBusinessId });

  if (memberships.length === 0) {
    return next(new AppError('You do not have access to this business', { statusCode: 403, code: 'TENANT_FORBIDDEN' }));
  }
  if (!requestedBusinessId && memberships.length > 1) {
    return next(new AppError('Select a business with the X-Business-Id header', { statusCode: 400, code: 'TENANT_REQUIRED' }));
  }

  const membership = memberships[0];
  req.tenant = { businessId: membership.businessId, role: membership.role, business: membership.business };
  return next();
}
