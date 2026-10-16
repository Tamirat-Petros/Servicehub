import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authRateLimiter } from '../../middlewares/rate-limiter.js';
import { validate } from '../../middlewares/validate.js';
import { authController } from './controller.js';
import { loginSchema, registerSchema } from './validation.js';

export const authRoutes = Router();
authRoutes.post('/register', authRateLimiter, validate(registerSchema), authController.register);
authRoutes.post('/login', authRateLimiter, validate(loginSchema), authController.login);
authRoutes.get('/me', authenticate, authController.me);
