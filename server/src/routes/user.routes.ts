import { Router } from 'express';
import { listUsers, getUser, updateUser, toggleUserStatus } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', requireAdmin, listUsers);
router.get('/:id', authenticate, getUser);
router.put('/:id', updateUser);
router.put('/:id/status', requireAdmin, toggleUserStatus);

export default router;
