import { Router } from 'express';
import {
  register,
  login,
  getMe,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (ต้องยืนยันตัวตนก่อน)
router.get('/me', authenticateToken, getMe);

export default router;
