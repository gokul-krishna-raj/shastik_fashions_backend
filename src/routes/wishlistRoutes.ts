import { Router } from 'express';
import { addItemToWishlist, getWishlistItems, removeWishlistItem,clearWishlist } from '../controllers/wishlistController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware'; // Import validate
import { wishlistItemSchema } from '../validation/wishlistValidation'; // Import schema

const router = Router();

router.route('/').post(protect, validate(wishlistItemSchema), addItemToWishlist).get(protect, getWishlistItems).delete(protect, clearWishlist);
router.route('/:id').delete(protect, removeWishlistItem);

export default router;