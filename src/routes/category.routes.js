import express from 'express';
import { createCategory, getCategories } from '../controllers/category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { categorySchema } from '../validators/product.validator.js';

const router = express.Router();

// Public listing
router.get('/', getCategories);

// Admin category management
router.post('/', protect, authorize('admin'), validate(categorySchema), createCategory);

export default router;
