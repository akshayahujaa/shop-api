import Cart from '../../models/cart.model.js';

/**
 * Action to retrieve the user's shopping cart populated with product details.
 * Creates an empty cart if one does not exist.
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} The cart document populated with product details
 */
export const getCartAction = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'name price discountPrice images stock'
  );

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }

  return cart;
};
