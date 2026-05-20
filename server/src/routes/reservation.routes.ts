import { Router } from 'express';
import {
  createReservation, getMyReservations, cancelReservation,
  fulfillReservation, getAllReservations,
} from '../controllers/reservation.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/my', getMyReservations);
router.get('/', requireAdmin, getAllReservations);
router.post('/', createReservation);
router.delete('/:id', cancelReservation);
router.put('/:id/fulfill', requireAdmin, fulfillReservation);

export default router;
