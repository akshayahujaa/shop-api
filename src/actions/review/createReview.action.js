import Review from '../../models/review.model.js';
import Product from '../../models/product.model.js';
import Order from '../../models/order.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to create a product review.
 * Verifies if the user has already reviewed the product, or if they purchased it.
 * @param {string} userId - User's ID reviewing
 * @param {Object} reviewData - product, rating, comment, images
 * @returns {Promise<Object>} The created Review document
 */
export const createReviewAction = async (userId, reviewData) => {
  const { product: productId, rating, comment, images } = reviewData;

  // 1. Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // 2. Optional MERN best practice: verify if the user purchased this product before allowing them to review
  const hasPurchased = await Order.findOne({
    user: userId,
    'items.product': productId,
    status: 'delivered',
  });

  if (!hasPurchased) {
    throw new ApiError(400, 'You can only review products that you have purchased and received.');
  }

  // 3. Verify if user already reviewed this product
  const existingReview = await Review.findOne({ user: userId, product: productId });
  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this product.');
  }

  // 4. Create the review
  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment,
    images: images || [],
  });

  return review;
};
