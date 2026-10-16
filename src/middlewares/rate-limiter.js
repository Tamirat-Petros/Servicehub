import rateLimit from 'express-rate-limit';
import { AppError } from '../common/AppError.js';

export const apiRateLimiter = rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false });
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new AppError('Too many authentication attempts; try again later', { statusCode: 429, code: 'RATE_LIMITED' })),
});
