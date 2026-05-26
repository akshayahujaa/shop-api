import express from 'express';
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator.js';

const router = express.Router();

// Public listing
router.get('/product/:productId', getReviews);

// Protected reviews operations
router.post('/', protect, validate(createReviewSchema), createReview);
router.put('/:id', protect, validate(updateReviewSchema), updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
