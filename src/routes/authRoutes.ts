import { Router } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  checkAdminRole,
} from '../controllers/authController';
import validate from '../middleware/validationMiddleware'; // Import validate
import { registerSchema, loginSchema } from '../validation/authValidation'; // Import schemas
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh-token', refreshAccessToken);
router.get('/check-admin', protect, checkAdminRole);

export default router;