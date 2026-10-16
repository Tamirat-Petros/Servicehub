import { staffService } from './service.js';

export const staffController = {
  list: async (req, res) => res.status(200).json({ data: await staffService.list(req.tenant.businessId) }),
  create: async (req, res) => res.status(201).json({ data: await staffService.create(req.tenant.businessId, req.body) }),
  update: async (req, res) => res.status(200).json({ data: await staffService.update(req.tenant.businessId, req.params.staffId, req.body) }),
  deactivate: async (req, res) => {
    await staffService.deactivate(req.tenant.businessId, req.params.staffId);
    res.status(204).end();
  },
  assignServices: async (req, res) => res.status(200).json({ data: await staffService.setServices(req.tenant.businessId, req.params.staffId, req.body.serviceIds) }),
};
