import { schedulesService } from './service.js';

export const schedulesController = {
  list: async (req, res) => res.status(200).json({ data: await schedulesService.list(req.tenant.businessId, req.query.staffId) }),
  replace: async (req, res) => res.status(200).json({ data: await schedulesService.replace(req.tenant.businessId, req.params.staffId, req.body.intervals, req.auth.userId) }),
};
