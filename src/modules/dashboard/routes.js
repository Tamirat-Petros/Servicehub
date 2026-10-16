import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { tenantContext } from '../../middlewares/tenant-context.js';
import { dashboardController } from './controller.js';

export const dashboardRoutes = Router();
dashboardRoutes.get('/summary', authenticate, tenantContext, requireRole('OWNER', 'ADMIN', 'STAFF'), dashboardController.summary);
