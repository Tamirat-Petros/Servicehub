import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requirePlatformAdmin } from '../../middlewares/platform-admin.js';
import { validate } from '../../middlewares/validate.js';
import { platformAdminController } from './controller.js';
import { platformBusinessListQuerySchema, updateBusinessStatusSchema } from './validation.js';

export const platformAdminRoutes = Router();
platformAdminRoutes.use(authenticate, requirePlatformAdmin);
platformAdminRoutes.get('/summary', platformAdminController.summary);
platformAdminRoutes.get('/businesses', validate(platformBusinessListQuerySchema, 'query'), platformAdminController.listBusinesses);
platformAdminRoutes.patch('/businesses/:businessId/status', validate(updateBusinessStatusSchema), platformAdminController.updateBusinessStatus);
