import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { tenantContext } from '../../middlewares/tenant-context.js';
import { businessesController } from './controller.js';

export const businessesRoutes = Router();
businessesRoutes.get('/current', authenticate, tenantContext, businessesController.current);
