import { randomUUID } from 'node:crypto';
import { AppError } from '../../common/AppError.js';
import { createAccessToken } from '../../lib/access-token.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { authRepository } from './repository.js';

const toPublicUser = ({ id, email, firstName, lastName, createdAt }) => ({ id, email, firstName, lastName, createdAt });

function makeSlug(name) {
  const base = name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'business';
  return `${base}-${randomUUID()}`;
}

export const authService = {
  async register(input) {
    if (await authRepository.findUserByEmail(input.email)) {
      throw new AppError('An account with this email already exists', { statusCode: 409, code: 'EMAIL_IN_USE' });
    }

    const passwordHash = await hashPassword(input.password);
    const { user, business } = await authRepository.createAccount({
      ...input,
      passwordHash,
      slug: makeSlug(input.businessName),
    });
    return {
      user: toPublicUser(user),
      business: { id: business.id, name: business.name, slug: business.slug, timeZone: business.timeZone, role: 'OWNER' },
      accessToken: createAccessToken(user.id),
      tokenType: 'Bearer',
    };
  },

  async login({ email, password }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user || user.status !== 'ACTIVE' || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError('Email or password is incorrect', { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }
    return { user: toPublicUser(user), accessToken: createAccessToken(user.id), tokenType: 'Bearer' };
  },

  async getProfile(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError('The account no longer exists', { statusCode: 401, code: 'UNAUTHENTICATED' });
    return {
      ...toPublicUser(user),
      businesses: user.memberships.map(({ role, business }) => ({ ...business, role })),
    };
  },
};
