import { usersService } from './service.js';

export const usersController = {
  me: async (req, res) => res.status(200).json({ data: await usersService.getCurrent(req.auth.userId) }),
  listMembers: async (req, res) => res.status(200).json({ data: await usersService.listBusinessMembers(req.tenant.businessId) }),
  addMembership: async (req, res) => res.status(201).json({ data: await usersService.addMembership({
    ...req.body,
    businessId: req.tenant.businessId,
    actorRole: req.tenant.role,
    actorUserId: req.auth.userId,
  }) }),
  removeMembership: async (req, res) => {
    await usersService.removeMembership({
      businessId: req.tenant.businessId,
      membershipId: req.params.membershipId,
      actorRole: req.tenant.role,
      actorUserId: req.auth.userId,
    });
    res.status(204).end();
  },
};
