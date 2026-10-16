import { z } from 'zod';

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  email,
  password: z.string().min(12).max(128),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  businessName: z.string().trim().min(2).max(120),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});
