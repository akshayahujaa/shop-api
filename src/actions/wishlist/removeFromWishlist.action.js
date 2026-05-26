import Wishlist from '../../models/wishlist.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to remove a product from the wishlist.
 * @param {string} userId - User's ID
 * @param {string} productId - Product ID
 */
export const removeFromWishlistAction = async (userId, productId) => {
  const item = await Wishlist.findOneAndDelete({ user: userId, product: productId });
  if (!item) {
    throw new ApiError(404, 'Product not found in your wishlist.');
  }
};
