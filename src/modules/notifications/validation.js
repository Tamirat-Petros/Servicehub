import { z } from 'zod';

export const notificationListQuerySchema = z.object({
  unreadOnly: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
