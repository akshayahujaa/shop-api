import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Protected routes (Seller / Admin only)
router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  validate(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  validate(updateProductSchema),
  updateProduct
);
router.delete(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  deleteProduct
);

export default router;
