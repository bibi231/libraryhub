import { Router } from 'express';
import {
  getOverview, getCirculationReport, getPopularReport,
  getOverdueReport, getInventoryReport, getPatronActivityReport, exportReport,
} from '../controllers/report.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/overview', getOverview);
router.get('/circulation', getCirculationReport);
router.get('/popular', getPopularReport);
router.get('/overdue', getOverdueReport);
router.get('/inventory', getInventoryReport);
router.get('/patron-activity', getPatronActivityReport);
router.get('/export/:type', exportReport);

export default router;
