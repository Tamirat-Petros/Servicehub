import { AppError } from '../common/AppError.js';
import { prisma } from '../database/prisma.js';

export async function requirePlatformAdmin(req, _res, next) {
  const user = await prisma.user.findFirst({
    where: { id: req.auth?.userId, status: 'ACTIVE', isPlatformAdmin: true },
    select: { id: true },
  });
  if (!user) return next(new AppError('Platform administrator access is required', { statusCode: 403, code: 'FORBIDDEN' }));
  req.platformAdmin = { userId: user.id };
  return next();
}
