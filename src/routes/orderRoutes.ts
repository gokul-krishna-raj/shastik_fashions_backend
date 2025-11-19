import { Router } from 'express';
import { confirmOrder, updateOrderStatus, getAllOrders } from '../controllers/orderController';
import { protect, authorize } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
import { confirmOrderSchema, updateOrderStatusSchema } from '../validation/orderValidation';

const router = Router();

router.route('/confirm').post(protect, validate(confirmOrderSchema), confirmOrder);
router.route('/admin').get(protect, authorize('admin'), getAllOrders);
router.route('/:id/status').put(protect, authorize('admin'), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
