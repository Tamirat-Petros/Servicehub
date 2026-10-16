import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.js';
import { publicBookingRateLimiter } from '../../middlewares/rate-limiter.js';
import { requireRole } from '../../middlewares/rbac.js';
import { tenantContext } from '../../middlewares/tenant-context.js';
import { validate } from '../../middlewares/validate.js';
import { appointmentsController } from './controller.js';
import { appointmentListQuerySchema, createAppointmentSchema, publicAvailabilityQuerySchema, updateAppointmentStatusSchema } from './validation.js';

export const appointmentsRoutes = Router();
appointmentsRoutes.use(authenticate, tenantContext);
appointmentsRoutes.get('/', requireRole('OWNER', 'ADMIN', 'STAFF'), validate(appointmentListQuerySchema, 'query'), appointmentsController.list);
appointmentsRoutes.patch('/:appointmentId/status', requireRole('OWNER', 'ADMIN'), validate(updateAppointmentStatusSchema), appointmentsController.updateStatus);

export const publicAppointmentsRoutes = Router();
publicAppointmentsRoutes.get('/:businessSlug/availability', validate(publicAvailabilityQuerySchema, 'query'), appointmentsController.publicAvailability);
publicAppointmentsRoutes.post('/:businessSlug/appointments', publicBookingRateLimiter, optionalAuthenticate, validate(createAppointmentSchema), appointmentsController.bookPublic);
