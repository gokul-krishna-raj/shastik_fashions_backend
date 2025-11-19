
import { Router } from 'express';
import { addAddress, getAddresses, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, addAddress);
router.get('/', protect, getAddresses);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);
router.patch('/:id/default', protect, setDefaultAddress);

export default router;
