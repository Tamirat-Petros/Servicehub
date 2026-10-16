import { z } from 'zod';

export const platformBusinessListQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const updateBusinessStatusSchema = z.object({ status: z.enum(['ACTIVE', 'SUSPENDED']) });
