import { z } from 'zod';

const serviceFields = {
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2_000).nullable(),
  durationMinutes: z.number().int().min(5).max(720),
  price: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/, 'Price must be a non-negative amount with up to two decimal places'),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  isActive: z.boolean(),
};

export const createServiceSchema = z.object({
  name: serviceFields.name,
  description: serviceFields.description.optional(),
  durationMinutes: serviceFields.durationMinutes,
  price: serviceFields.price,
  currency: serviceFields.currency.optional(),
});

export const updateServiceSchema = z.object(serviceFields).partial().refine((value) => Object.keys(value).length > 0, 'Provide at least one service field to update');
