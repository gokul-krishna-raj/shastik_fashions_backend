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
import validate, { validateQuery } from '../middleware/validationMiddleware'; // Import validate and validateQuery
import { createProductSchema, updateProductSchema, getProductsQuerySchema } from '../validation/productValidation'; // Import schemas

const router = Router();

router
  .route('/')
  .post(protect, authorize('admin'), upload, validate(createProductSchema), createProduct)
  .get(validateQuery(getProductsQuerySchema), getProducts);


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