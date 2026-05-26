import User from '../../models/user.model.js';
import Cart from '../../models/cart.model.js';
import Wishlist from '../../models/wishlist.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to delete a user profile and their associated data (cart, wishlist).
 * @param {string} userId - The user ID to delete
 */
export const deleteUserAction = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  // Delete user document
  await User.findByIdAndDelete(userId);

  // Clean up associated documents in parallel
  await Promise.all([
    Cart.findOneAndDelete({ user: userId }),
    Wishlist.deleteMany({ user: userId }),
  ]);
};
