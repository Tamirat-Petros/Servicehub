import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { tenantContext } from '../../middlewares/tenant-context.js';
import { validate } from '../../middlewares/validate.js';
import { servicesController } from './controller.js';
import { createServiceSchema, updateServiceSchema } from './validation.js';

export const servicesRoutes = Router();
servicesRoutes.use(authenticate, tenantContext);
servicesRoutes.get('/', servicesController.list);
servicesRoutes.post('/', requireRole('OWNER', 'ADMIN'), validate(createServiceSchema), servicesController.create);
servicesRoutes.patch('/:serviceId', requireRole('OWNER', 'ADMIN'), validate(updateServiceSchema), servicesController.update);
servicesRoutes.delete('/:serviceId', requireRole('OWNER', 'ADMIN'), servicesController.deactivate);

export const publicServicesRoutes = Router();
publicServicesRoutes.get('/:businessSlug/services', servicesController.publicCatalog);
