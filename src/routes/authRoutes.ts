import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import validate from '../middleware/validationMiddleware'; // Import validate
import { registerSchema, loginSchema } from '../validation/authValidation'; // Import schemas

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

export default router;