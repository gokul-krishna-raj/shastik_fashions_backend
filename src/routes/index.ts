import { Router } from 'express';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import paymentRoutes from './paymentRoutes';
import orderRoutes from './orderRoutes';
import addressRoutes from './addressRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Define your routes here
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/payment', paymentRoutes);
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/address', addressRoutes);
router.use('/admin', adminRoutes);

export default router;