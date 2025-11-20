import { Router } from 'express';
import {
  confirmOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
import {
  confirmOrderSchema,
  updateOrderStatusSchema,
} from '../validation/orderValidation';

const router = Router();

router.route('/confirm').post(protect, validate(confirmOrderSchema), confirmOrder);
router.route('/admin').get(protect, authorize('admin'), getAllOrders);
router
  .route('/:orderId/status')
  .put(
    protect,
    authorize('admin'),
    validate(updateOrderStatusSchema),
    updateOrderStatus
  );
router.route('/:orderId').get(protect, getOrderById);

export default router;

