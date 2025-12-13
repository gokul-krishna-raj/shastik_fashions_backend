import { Router } from 'express';
import { getStats } from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.route('/stats').get(protect, authorize('admin'), getStats);

export default router;
