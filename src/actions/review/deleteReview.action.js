import Review from '../../models/review.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to delete a product review.
 * @param {string} reviewId - Review ID
 * @param {Object} currentUser - User deleting review (id, role)
 */
export const deleteReviewAction = async (reviewId, currentUser) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  // Perms check: user can delete their own review, admin can delete any review
  if (currentUser.role !== 'admin' && review.user.toString() !== currentUser.id) {
    throw new ApiError(403, 'Forbidden. You do not have permission to delete this review.');
  }

  // Delete review document. Uses findOneAndDelete to trigger post/^findOneAnd/ middleware on schema
  await Review.findOneAndDelete({ _id: reviewId });
};
