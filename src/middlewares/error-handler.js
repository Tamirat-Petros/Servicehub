import { AppError } from '../common/AppError.js';
import { logger } from '../lib/logger.js';

export function errorHandler(error, req, res, _next) {
  const appError = error instanceof AppError
    ? error
    : error?.code === 'P2002'
      ? new AppError('A record with these details already exists', { statusCode: 409, code: 'CONFLICT' })
      : error?.type === 'entity.parse.failed'
        ? new AppError('The request body must contain valid JSON', { statusCode: 400, code: 'INVALID_JSON' })
        : new AppError('An unexpected error occurred');
  if (!(error instanceof AppError)) logger.error({ err: error, requestId: req.id }, 'Unhandled request error');
  res.status(appError.statusCode).json({
    error: { code: appError.code, message: appError.message, ...(appError.details === undefined ? {} : { details: appError.details }) },
  });
}
