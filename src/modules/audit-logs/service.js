import { AppError } from '../../common/AppError.js';
import { auditLogsRepository } from './repository.js';

export const auditLogsService = {
  async list(query) {
    const rows = await auditLogsRepository.list(query);
    if (!rows) throw new AppError('Audit log page cursor not found for this business', { statusCode: 400, code: 'INVALID_CURSOR' });
    const items = rows.slice(0, query.limit);
    return { items, nextCursor: rows.length > query.limit ? items.at(-1).id : null };
  },
};
