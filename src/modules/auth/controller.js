import { authService } from './service.js';

export const authController = {
  register: async (req, res) => res.status(201).json({ data: await authService.register(req.body) }),
  login: async (req, res) => res.status(200).json({ data: await authService.login(req.body) }),
  me: async (req, res) => res.status(200).json({ data: await authService.getProfile(req.auth.userId) }),
};
