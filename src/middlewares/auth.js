import { AppError } from '../common/AppError.js';
import { verifyAccessToken } from '../lib/access-token.js';

export function authenticate(req, _res, next) {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return next(new AppError('A bearer access token is required', { statusCode: 401, code: 'UNAUTHENTICATED' }));
  }

  try {
    req.auth = verifyAccessToken(authorization.slice(7).trim());
    return next();
  } catch (error) {
    return next(error);
  }
}
