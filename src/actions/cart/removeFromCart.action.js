import Cart from '../../models/cart.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to remove an item from the shopping cart.
 * @param {string} userId - User's ID
 * @param {string} productId - Product ID to remove
 * @returns {Promise<Object>} Updated cart document
 */
export const removeFromCartAction = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found.');
  }

  const initialItemsLength = cart.items.length;
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  if (cart.items.length === initialItemsLength) {
    throw new ApiError(404, 'Item not found in cart.');
  }

  await cart.save();

  return await Cart.findById(cart._id).populate('items.product', 'name price discountPrice images stock');
};
