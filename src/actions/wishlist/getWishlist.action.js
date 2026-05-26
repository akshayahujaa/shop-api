import Wishlist from '../../models/wishlist.model.js';
import { paginateQuery } from '../../utils/pagination.util.js';

/**
 * Action to retrieve user's wishlist using infinite scroll.
 * @param {string} userId - User's ID
 * @param {Object} queryParams - page, limit
 * @returns {Promise<Object>} Paginated wishlist items
 */
export const getWishlistAction = async (userId, queryParams = {}) => {
  const { page, limit } = queryParams;

  const result = await paginateQuery(
    Wishlist,
    { user: userId },
    {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: 'product',
        select: 'name price discountPrice images stock ratings isActive',
      },
    }
  );

  return result;
};
