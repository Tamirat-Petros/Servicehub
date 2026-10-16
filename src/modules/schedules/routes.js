import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { tenantContext } from '../../middlewares/tenant-context.js';
import { validate } from '../../middlewares/validate.js';
import { schedulesController } from './controller.js';
import { replaceScheduleSchema } from './validation.js';

export const schedulesRoutes = Router();
schedulesRoutes.use(authenticate, tenantContext);
schedulesRoutes.get('/', schedulesController.list);
schedulesRoutes.put('/:staffId', requireRole('OWNER', 'ADMIN'), validate(replaceScheduleSchema), schedulesController.replace);
