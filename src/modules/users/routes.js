import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { tenantContext } from '../../middlewares/tenant-context.js';
import { validate } from '../../middlewares/validate.js';
import { usersController } from './controller.js';
import { addMembershipSchema } from './validation.js';

export const usersRoutes = Router();
usersRoutes.get('/me', authenticate, usersController.me);
usersRoutes.get('/memberships', authenticate, tenantContext, requireRole('OWNER', 'ADMIN'), usersController.listMembers);
usersRoutes.post('/memberships', authenticate, tenantContext, requireRole('OWNER', 'ADMIN'), validate(addMembershipSchema), usersController.addMembership);
usersRoutes.delete('/memberships/:membershipId', authenticate, tenantContext, requireRole('OWNER', 'ADMIN'), usersController.removeMembership);
