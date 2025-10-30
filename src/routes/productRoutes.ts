import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getBestSellers,
  getNewArrivals,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../config/multer';
import validate from '../middleware/validationMiddleware'; // Import validate
import { createProductSchema, updateProductSchema } from '../validation/productValidation'; // Import schemas

const router = Router();

router
  .route('/')
  .post(protect, authorize('admin'), upload, validate(createProductSchema), createProduct)
  .get(getProducts);

router
  .route('/best-sellers')
  .get(getBestSellers);

router
  .route('/new-arrivals')
  .get(getNewArrivals);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), upload, validate(updateProductSchema), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

export default router;