import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, getMe, logout, resetPasswordRequest, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, try again in 15 minutes' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/reset-password/request', authLimiter, resetPasswordRequest);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
