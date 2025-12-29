import { Router } from 'express';
import { addItemToCart, getCartItems, removeCartItem, clearCart,updateCartItem } from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware'; // Import validate
import { cartItemSchema } from '../validation/cartValidation'; // Import schema

const router = Router();

router.route('/').post(protect, validate(cartItemSchema), addItemToCart).get(protect, getCartItems).delete(protect, clearCart);
router.route('/:id').delete(protect, removeCartItem);
router.put('/update', protect, updateCartItem);

export default router;