import Cart from '../../models/cart.model.js';
import Product from '../../models/product.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to update quantity/price of a specific item in the cart.
 * @param {string} userId - User's ID
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart document
 */
export const updateCartItemAction = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found.');
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart.');
  }

  // Verify stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stock} units available.`);
  }

  // Update item details
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.discountPrice || product.price;

  await cart.save();

  return await Cart.findById(cart._id).populate('items.product', 'name price discountPrice images stock');
};
