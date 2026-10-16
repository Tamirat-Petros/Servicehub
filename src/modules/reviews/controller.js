import { reviewsService } from './service.js';

export const reviewsController = {
  listPublic: async (req, res) => res.status(200).json({ data: await reviewsService.listPublic(req.params.businessSlug) }),
  create: async (req, res) => res.status(201).json({ data: await reviewsService.create({
    ...req.body,
    businessSlug: req.params.businessSlug,
    appointmentId: req.params.appointmentId,
    customerUserId: req.auth.userId,
  }) }),
};
