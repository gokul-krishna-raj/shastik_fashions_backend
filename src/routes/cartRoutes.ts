import { Router } from 'express';
import { addItemToCart, getCartItems, removeCartItem } from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware'; // Import validate
import { cartItemSchema } from '../validation/cartValidation'; // Import schema

const router = Router();

router.route('/').post(protect, validate(cartItemSchema), addItemToCart).get(protect, getCartItems);
router.route('/:id').delete(protect, removeCartItem);

export default router;