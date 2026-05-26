import Review from '../../models/review.model.js';
import { paginateQuery } from '../../utils/pagination.util.js';

/**
 * Action to retrieve paginated reviews of a product (infinite scroll).
 * @param {string} productId - Product ID
 * @param {Object} queryParams - page, limit
 * @returns {Promise<Object>} Paginated reviews list
 */
export const getReviewsAction = async (productId, queryParams = {}) => {
  const { page, limit } = queryParams;

  const result = await paginateQuery(
    Review,
    { product: productId },
    {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'user', select: 'name avatar' },
    }
  );

  return result;
};
