import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware'; // Import validate
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from '../validation/paymentValidation'; // Import schemas

const router = Router();

router.post('/order', protect, validate(createRazorpayOrderSchema), createRazorpayOrder);
router.post('/verify', protect, validate(verifyRazorpayPaymentSchema), verifyRazorpayPayment);

export default router;