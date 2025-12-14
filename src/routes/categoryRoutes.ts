import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect, authorize } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware'; // Import validate
import { createCategorySchema, updateCategorySchema } from '../validation/categoryValidation'; // Import schemas

const router = Router();

router
  .route('/')
  .post(protect, authorize('admin'), validate(createCategorySchema), createCategory)
  .get(getCategories);

router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, authorize('admin'), validate(updateCategorySchema), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;