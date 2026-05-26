import Review from '../../models/review.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to update a product review.
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @param {Object} updateData - rating, comment, images
 * @returns {Promise<Object>} Updated Review document
 */
export const updateReviewAction = async (reviewId, userId, updateData) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  if (review.user.toString() !== userId) {
    throw new ApiError(403, 'Forbidden. You do not own this review.');
  }

  // Update allowed fields
  if (updateData.rating !== undefined) review.rating = updateData.rating;
  if (updateData.comment !== undefined) review.comment = updateData.comment;
  if (updateData.images !== undefined) review.images = updateData.images;

  await review.save(); // post-save triggers recalculateAverageRating

  return review;
};
