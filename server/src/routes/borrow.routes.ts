import { Router } from 'express';
import {
  checkout, returnBook, renewBorrow, getMyBorrows,
  getMyBorrowHistory, getOverdueBorrows, getActiveBorrows,
} from '../controllers/borrow.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/my', getMyBorrows);
router.get('/my/history', getMyBorrowHistory);
router.get('/overdue', requireAdmin, getOverdueBorrows);
router.get('/active', requireAdmin, getActiveBorrows);
router.post('/checkout', requireAdmin, checkout);
router.post('/return', requireAdmin, returnBook);
router.put('/:id/renew', renewBorrow);

export default router;
