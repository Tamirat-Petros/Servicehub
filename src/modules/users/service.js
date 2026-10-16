import { AppError } from '../../common/AppError.js';
import { authService } from '../auth/service.js';
import { usersRepository } from './repository.js';

export const usersService = {
  getCurrent: (userId) => authService.getProfile(userId),
  listBusinessMembers: (businessId) => usersRepository.listBusinessMembers(businessId),
  async addMembership({ businessId, email, role, actorRole }) {
    if (role === 'ADMIN' && actorRole !== 'OWNER') {
      throw new AppError('Only a business owner can add administrators', { statusCode: 403, code: 'FORBIDDEN' });
    }
    const user = await usersRepository.findUserByEmail(email);
    if (!user) throw new AppError('Create the user account before adding it to this business', { statusCode: 404, code: 'USER_NOT_FOUND' });
    return usersRepository.addMembership({ businessId, userId: user.id, role });
  },
  async removeMembership({ businessId, membershipId, actorRole }) {
    if (actorRole !== 'OWNER') {
      const members = await usersRepository.listBusinessMembers(businessId);
      const target = members.find((member) => member.id === membershipId);
      if (!target) throw new AppError('Membership not found', { statusCode: 404, code: 'MEMBERSHIP_NOT_FOUND' });
      if (target.role === 'ADMIN') throw new AppError('Only a business owner can remove an administrator', { statusCode: 403, code: 'FORBIDDEN' });
    }
    const result = await usersRepository.removeMembership({ businessId, membershipId });
    if (result.count === 0) throw new AppError('Membership not found or cannot be removed', { statusCode: 404, code: 'MEMBERSHIP_NOT_FOUND' });
  },
};
