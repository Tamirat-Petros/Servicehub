import { z } from 'zod';

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startsAt: z.string().datetime({ offset: true }).transform((value) => new Date(value)),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  customerPhone: z.string().trim().max(40).nullable().optional(),
  notes: z.string().trim().max(1_000).nullable().optional(),
});

export const appointmentListQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).transform((value) => new Date(value)).optional(),
  to: z.string().datetime({ offset: true }).transform((value) => new Date(value)).optional(),
  staffId: z.string().min(1).optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
}).refine(({ from, to }) => !from || !to || from < to, {
  message: 'The from date must be before the to date',
  path: ['to'],
});

export const publicAvailabilityQuerySchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Date must be a real calendar date'),
  staffId: z.string().min(1).optional(),
});

export const updateAppointmentStatusSchema = z.object({ status: z.enum(['CANCELLED', 'COMPLETED']) });
