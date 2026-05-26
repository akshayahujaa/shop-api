import Cart from '../../models/cart.model.js';
import Product from '../../models/product.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to add an item to the user's shopping cart.
 * Checks stock availability, merges duplicates, and saves.
 * @param {string} userId - User's ID
 * @param {string} productId - Product's ID to add
 * @param {number} quantity - Quantity of the item
 * @returns {Promise<Object>} The updated cart document populated with product details
 */
export const addToCartAction = async (userId, productId, quantity) => {
  // 1. Fetch product to verify existence and check stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  if (!product.isActive) {
    throw new ApiError(400, 'Product is no longer active.');
  }

  // 2. Fetch or create cart for user
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }

  // 3. Find if item already exists in the cart
  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  const currentQuantity = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
  const targetQuantity = currentQuantity + quantity;

  // 4. Validate stock limits
  if (product.stock < targetQuantity) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stock} units available.`);
  }

  // Determine price (use discountPrice if available)
  const itemPrice = product.discountPrice || product.price;

  // 5. Add or update item quantity
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = targetQuantity;
    cart.items[itemIndex].price = itemPrice;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: itemPrice,
    });
  }

  // 6. Save cart (re-calculates totalAmount in pre-save hook)
  await cart.save();

  // Populate product details for the client response
  return await Cart.findById(cart._id).populate('items.product', 'name price discountPrice images stock');
};
