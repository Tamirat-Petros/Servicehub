import { AppError } from '../../common/AppError.js';
import { platformAdminRepository } from './repository.js';

export const platformAdminService = {
  getSummary: () => platformAdminRepository.getSummary(),
  async listBusinesses(query) {
    const rows = await platformAdminRepository.listBusinesses(query);
    if (!rows) throw new AppError('Business page cursor not found', { statusCode: 400, code: 'INVALID_CURSOR' });
    const items = rows.slice(0, query.limit);
    return { items, nextCursor: rows.length > query.limit ? items.at(-1).id : null };
  },
  async updateBusinessStatus(input) {
    const business = await platformAdminRepository.updateBusinessStatus(input);
    if (!business) throw new AppError('Business not found', { statusCode: 404, code: 'BUSINESS_NOT_FOUND' });
    return business;
  },
};
