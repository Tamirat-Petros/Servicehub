import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { tenantContext } from '../../middlewares/tenant-context.js';
import { validate } from '../../middlewares/validate.js';
import { auditLogsController } from './controller.js';
import { auditLogListQuerySchema } from './validation.js';

export const auditLogsRoutes = Router();
auditLogsRoutes.use(authenticate, tenantContext, requireRole('OWNER', 'ADMIN'));
auditLogsRoutes.get('/', validate(auditLogListQuerySchema, 'query'), auditLogsController.list);
