import { z } from 'zod';

export const addMembershipSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  role: z.enum(['ADMIN', 'STAFF', 'CUSTOMER']),
});
