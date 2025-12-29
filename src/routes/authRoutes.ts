import { Router } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  checkAdminRole,
  updateProfile,
  getProfile,
} from '../controllers/authController';
import validate from '../middleware/validationMiddleware'; // Import validate
import { registerSchema, loginSchema, profileUpdateSchema } from '../validation/authValidation'; // Import schemas
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh-token', refreshAccessToken);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(profileUpdateSchema), updateProfile);
router.get('/check-admin', protect, checkAdminRole);

export default router;