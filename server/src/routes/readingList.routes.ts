import { Router } from 'express';
import { addToReadingList, removeFromReadingList, getReadingList } from '../controllers/readingList.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getReadingList);
router.post('/:bookId', addToReadingList);
router.delete('/:bookId', removeFromReadingList);

export default router;
