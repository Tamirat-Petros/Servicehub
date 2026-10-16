import { businessesService } from './service.js';

export const businessesController = {
  current: (req, res) => res.status(200).json({ data: businessesService.getCurrent(req.tenant) }),
};
