import { AppError } from '../common/AppError.js';

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.tenant) return next(new AppError('Tenant context is required', { statusCode: 500, code: 'TENANT_CONTEXT_MISSING' }));
  if (!roles.includes(req.tenant.role)) {
    return next(new AppError('You do not have permission to perform this action', { statusCode: 403, code: 'FORBIDDEN' }));
  }
  return next();
};
