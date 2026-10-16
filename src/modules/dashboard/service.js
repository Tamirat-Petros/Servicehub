import { dashboardRepository } from './repository.js';

export const dashboardService = {
  getSummary: ({ businessId, timeZone, role }) => dashboardRepository.getSummary({
    businessId,
    timeZone,
    includeRevenue: role === 'OWNER' || role === 'ADMIN',
  }),
};
