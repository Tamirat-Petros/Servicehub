import { z } from 'zod';

const optionalText = (max) => z.string().trim().max(max).nullable().optional();

export const createStaffSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()).nullable().optional(),
  phone: optionalText(40),
});

export const updateStaffSchema = createStaffSchema.partial().extend({ isActive: z.boolean().optional() })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one staff field to update');

export const assignStaffServicesSchema = z.object({
  serviceIds: z.array(z.string().min(1)).max(100),
}).refine(({ serviceIds }) => new Set(serviceIds).size === serviceIds.length, 'Service IDs must be unique');
