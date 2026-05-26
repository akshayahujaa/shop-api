import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import reviewRoutes from './review.routes.js';
import paymentRoutes from './payment.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import adminRoutes from './admin.routes.js';
// import couponRoutes from './coupon.routes.js';

const router = express.Router();

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/admin', adminRoutes);
// router.use('/coupons', couponRoutes);

export default router;
