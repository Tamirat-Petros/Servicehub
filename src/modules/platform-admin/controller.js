import { platformAdminService } from './service.js';

export const platformAdminController = {
  summary: async (_req, res) => res.status(200).json({ data: await platformAdminService.getSummary() }),
  listBusinesses: async (req, res) => res.status(200).json({ data: await platformAdminService.listBusinesses(req.validatedQuery) }),
  updateBusinessStatus: async (req, res) => res.status(200).json({ data: await platformAdminService.updateBusinessStatus({
    businessId: req.params.businessId,
    status: req.body.status,
    actorUserId: req.platformAdmin.userId,
  }) }),
};
