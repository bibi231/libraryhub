import { Router } from 'express';
import { getMyFines, getAllFines, payFine, waiveFine } from '../controllers/fine.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/my', getMyFines);
router.get('/', requireAdmin, getAllFines);
router.put('/:id/pay', requireAdmin, payFine);
router.put('/:id/waive', requireAdmin, waiveFine);

export default router;
