import { auditLogsService } from './service.js';

export const auditLogsController = {
  list: async (req, res) => res.status(200).json({ data: await auditLogsService.list({ businessId: req.tenant.businessId, ...req.validatedQuery }) }),
};
