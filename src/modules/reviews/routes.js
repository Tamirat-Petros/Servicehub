import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { reviewsController } from './controller.js';
import { createReviewSchema } from './validation.js';

export const publicReviewsRoutes = Router();
publicReviewsRoutes.get('/:businessSlug/reviews', reviewsController.listPublic);
publicReviewsRoutes.post('/:businessSlug/appointments/:appointmentId/reviews', authenticate, validate(createReviewSchema), reviewsController.create);
