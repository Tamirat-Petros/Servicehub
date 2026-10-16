import { servicesService } from './service.js';

export const servicesController = {
  list: async (req, res) => res.status(200).json({ data: await servicesService.list(req.tenant.businessId) }),
  create: async (req, res) => res.status(201).json({ data: await servicesService.create(req.tenant.businessId, req.body) }),
  update: async (req, res) => res.status(200).json({ data: await servicesService.update(req.tenant.businessId, req.params.serviceId, req.body) }),
  deactivate: async (req, res) => {
    await servicesService.deactivate(req.tenant.businessId, req.params.serviceId);
    res.status(204).end();
  },
};
