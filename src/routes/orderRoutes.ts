import { Router } from 'express';
import { createOrder, getUserOrders, updateOrderStatus, getAllOrders } from '../controllers/orderController';
import { protect, authorize } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware'; // Import validate
import { createOrderSchema, updateOrderStatusSchema } from '../validation/orderValidation'; // Import schemas

const router = Router();

router.route('/').post(protect, validate(createOrderSchema), createOrder).get(protect, getUserOrders);
router.route('/admin').get(protect, authorize('admin'), getAllOrders);
router.route('/:id/status').put(protect, authorize('admin'), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;