import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { tenantContext } from '../../middlewares/tenant-context.js';
import { validate } from '../../middlewares/validate.js';
import { staffController } from './controller.js';
import { assignStaffServicesSchema, createStaffSchema, updateStaffSchema } from './validation.js';

export const staffRoutes = Router();
staffRoutes.use(authenticate, tenantContext);
staffRoutes.get('/', staffController.list);
staffRoutes.post('/', requireRole('OWNER', 'ADMIN'), validate(createStaffSchema), staffController.create);
staffRoutes.patch('/:staffId', requireRole('OWNER', 'ADMIN'), validate(updateStaffSchema), staffController.update);
staffRoutes.put('/:staffId/services', requireRole('OWNER', 'ADMIN'), validate(assignStaffServicesSchema), staffController.assignServices);
staffRoutes.delete('/:staffId', requireRole('OWNER', 'ADMIN'), staffController.deactivate);
