import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

export async function verifyPassword(password, encodedHash) {
  const [algorithm, saltText, keyText] = encodedHash.split('$');
  if (algorithm !== 'scrypt' || !saltText || !keyText) return false;

  const salt = Buffer.from(saltText, 'base64url');
  const expectedKey = Buffer.from(keyText, 'base64url');
  if (expectedKey.length !== KEY_LENGTH) return false;

  const actualKey = await scrypt(password, salt, KEY_LENGTH);
  return timingSafeEqual(expectedKey, actualKey);
}
