import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from '../common/AppError.js';

const ISSUER = 'servicehub-api';
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const signatureFor = (input) => createHmac('sha256', env.JWT_ACCESS_SECRET).update(input).digest();

export function createAccessToken(userId) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ sub: userId, iss: ISSUER, iat: now, exp: now + env.JWT_ACCESS_TTL_SECONDS });
  const unsignedToken = `${header}.${payload}`;
  return `${unsignedToken}.${signatureFor(unsignedToken).toString('base64url')}`;
}

export function verifyAccessToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw invalidToken();

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const actualSignature = Buffer.from(encodedSignature, 'base64url');
  const expectedSignature = signatureFor(unsignedToken);
  if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) {
    throw invalidToken();
  }

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (
      header.alg !== 'HS256' ||
      payload.iss !== ISSUER ||
      typeof payload.sub !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= now
    ) {
      throw invalidToken();
    }
    return { userId: payload.sub };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw invalidToken();
  }
}

function invalidToken() {
  return new AppError('A valid access token is required', { statusCode: 401, code: 'UNAUTHENTICATED' });
}
