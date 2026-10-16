import { dashboardService } from './service.js';

export const dashboardController = {
  summary: async (req, res) => res.status(200).json({ data: await dashboardService.getSummary({
    businessId: req.tenant.businessId,
    timeZone: req.tenant.business.timeZone,
    role: req.tenant.role,
  }) }),
};
