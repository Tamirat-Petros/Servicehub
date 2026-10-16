import { appointmentsService } from './service.js';

export const appointmentsController = {
  publicAvailability: async (req, res) => res.status(200).json({ data: await appointmentsService.publicAvailability({
    businessSlug: req.params.businessSlug,
    ...req.validatedQuery,
  }) }),
  bookPublic: async (req, res) => res.status(201).json({ data: await appointmentsService.book({
    businessSlug: req.params.businessSlug,
    input: { ...req.body, customerUserId: req.auth?.userId },
  }) }),
  list: async (req, res) => res.status(200).json({ data: await appointmentsService.list({ businessId: req.tenant.businessId, ...req.validatedQuery }) }),
  updateStatus: async (req, res) => res.status(200).json({ data: await appointmentsService.updateStatus({
    businessId: req.tenant.businessId,
    appointmentId: req.params.appointmentId,
    status: req.body.status,
  }) }),
};
