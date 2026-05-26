import Wishlist from '../../models/wishlist.model.js';
import Product from '../../models/product.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to add a product to the user's wishlist.
 * @param {string} userId - User's ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Created Wishlist document populated with product details
 */
export const addToWishlistAction = async (userId, productId) => {
  // 1. Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // 2. Check if already in wishlist
  const existingItem = await Wishlist.findOne({ user: userId, product: productId });
  if (existingItem) {
    throw new ApiError(400, 'Product is already in your wishlist.');
  }

  // 3. Create wishlist entry
  const item = await Wishlist.create({
    user: userId,
    product: productId,
  });

  return await Wishlist.findById(item._id).populate('product', 'name price discountPrice images stock ratings');
};
