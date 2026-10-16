import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/servicehub?schema=public'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(32).default('servicehub-local-development-secret-change-me'),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
}).superRefine((config, context) => {
  if (
    config.NODE_ENV === 'production' &&
    (config.JWT_ACCESS_SECRET === 'servicehub-local-development-secret-change-me' || config.JWT_ACCESS_SECRET.startsWith('replace-with-'))
  ) {
    context.addIssue({ code: 'custom', path: ['JWT_ACCESS_SECRET'], message: 'Set a unique JWT_ACCESS_SECRET in production' });
  }
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('Invalid environment configuration:', result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = Object.freeze(result.data);
