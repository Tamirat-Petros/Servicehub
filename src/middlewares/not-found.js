import { AppError } from '../common/AppError.js';

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, { statusCode: 404, code: 'NOT_FOUND' }));
}
