import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpayPayment,createRazorpayOrderV2, verifyRazorpayPaymentV2 } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware'; // Import validate
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from '../validation/paymentValidation'; // Import schemas

const router = Router();

// Existing endpoints
router.post('/order', protect, validate(createRazorpayOrderSchema), createRazorpayOrder);
router.post('/verify', protect, validate(verifyRazorpayPaymentSchema), verifyRazorpayPayment);

// Additional endpoints matching frontend flow
router.post('/razorpay/create-order', protect, validate(createRazorpayOrderSchema), createRazorpayOrderV2);
router.post('/razorpay/verify', protect, validate(verifyRazorpayPaymentSchema), verifyRazorpayPaymentV2);

export default router;