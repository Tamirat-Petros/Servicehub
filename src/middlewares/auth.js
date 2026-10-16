import { AppError } from '../common/AppError.js';
import { prisma } from '../database/prisma.js';
import { verifyAccessToken } from '../lib/access-token.js';

async function userFromHeader(authorization) {
  const { userId } = verifyAccessToken(authorization.slice(7).trim());
  const user = await prisma.user.findFirst({ where: { id: userId, status: 'ACTIVE' }, select: { id: true } });
  if (!user) throw new AppError('A valid active account is required', { statusCode: 401, code: 'UNAUTHENTICATED' });
  return { userId: user.id };
}

export async function authenticate(req, _res, next) {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return next(new AppError('A bearer access token is required', { statusCode: 401, code: 'UNAUTHENTICATED' }));
  }

  try {
    req.auth = await userFromHeader(authorization);
    return next();
  } catch (error) {
    return next(error);
  }
}

export async function optionalAuthenticate(req, _res, next) {
  const authorization = req.get('authorization');
  if (!authorization) return next();
  if (!authorization.startsWith('Bearer ')) {
    return next(new AppError('Authorization must use a bearer access token', { statusCode: 401, code: 'UNAUTHENTICATED' }));
  }
  try {
    req.auth = await userFromHeader(authorization);
    return next();
  } catch (error) {
    return next(error);
  }
}
