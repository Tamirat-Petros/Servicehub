import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { notificationsController } from './controller.js';
import { notificationListQuerySchema } from './validation.js';

export const notificationsRoutes = Router();
notificationsRoutes.use(authenticate);
notificationsRoutes.get('/', validate(notificationListQuerySchema, 'query'), notificationsController.list);
notificationsRoutes.patch('/:notificationId/read', notificationsController.markRead);
