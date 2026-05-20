import { Router } from 'express';
import multer from 'multer';
import {
  listBooks, getBook, createBook, updateBook, deleteBook,
  getCategories, getPopularBooks, getNewArrivals, lookupIsbn, bulkImport,
} from '../controllers/book.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', listBooks);
router.get('/categories', getCategories);
router.get('/popular', getPopularBooks);
router.get('/new-arrivals', getNewArrivals);
router.get('/isbn/:isbn', lookupIsbn);
router.get('/:id', getBook);
router.post('/', authenticate, requireAdmin, createBook);
router.post('/bulk-import', authenticate, requireAdmin, upload.single('file'), bulkImport);
router.put('/:id', authenticate, requireAdmin, updateBook);
router.delete('/:id', authenticate, requireAdmin, deleteBook);

export default router;
