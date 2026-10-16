import { AppError } from '../common/AppError.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(new AppError('Request validation failed', {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: result.error.issues.map(({ path, message, code }) => ({ path, message, code })),
    }));
  }
  if (source === 'query') req.validatedQuery = result.data;
  else req[source] = result.data;
  return next();
};
