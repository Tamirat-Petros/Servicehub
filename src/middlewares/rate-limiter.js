import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false });
