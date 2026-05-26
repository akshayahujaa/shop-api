import Order from '../../models/order.model.js';
import Cart from '../../models/cart.model.js';
import Product from '../../models/product.model.js';
import Address from '../../models/address.model.js';
// import Coupon from '../../models/coupon.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ORDER_STATUS, PAYMENT_METHODS } from '../../utils/constants.js';

/**
 * Action to place an order from the user's current cart.
 * Validates stock, calculates pricing, applies optional coupons, decrements stock, and empties cart.
 * @param {string} userId - User's ID placing the order
 * @param {Object} orderPayload - Payload containing address details, payment method, and coupon
 * @returns {Promise<Object>} The created Order document
 */
export const createOrderAction = async (userId, orderPayload) => {
  const { addressId, shippingAddress, paymentMethod, couponCode } = orderPayload;

  // 1. Resolve shipping address
  let resolvedAddress = shippingAddress;
  if (addressId) {
    const savedAddress = await Address.findOne({ _id: addressId, user: userId });
    if (!savedAddress) {
      throw new ApiError(404, 'Saved shipping address not found.');
    }
    resolvedAddress = {
      fullName: savedAddress.fullName,
      phone: savedAddress.phone,
      street: savedAddress.street,
      city: savedAddress.city,
      state: savedAddress.state,
      pincode: savedAddress.pincode,
      country: savedAddress.country,
    };
  }

  if (!resolvedAddress) {
    throw new ApiError(400, 'Shipping address is required.');
  }

  // 2. Fetch user's cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cannot place order. Your shopping cart is empty.');
  }

  // 3. Validate stock availability and prepare order items
  const orderItems = [];
  const stockUpdatePromises = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product "${product ? product.name : 'Unknown'}" is no longer available.`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Product "${product.name}" has insufficient stock. Only ${product.stock} left.`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: item.price,
      quantity: item.quantity,
    });

    // Push decrement stock promise
    stockUpdatePromises.push(
      Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      )
    );
  }

  // 4. Calculate prices
  let itemsPrice = cart.totalAmount;
  let discount = 0;

  // 5. Apply coupon if provided
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      throw new ApiError(404, 'Invalid coupon code.');
    }

    if (!coupon.isValid(itemsPrice)) {
      throw new ApiError(400, 'Coupon is invalid, expired, or minimum amount condition not met.');
    }

    if (coupon.discountType === 'percent') {
      discount = (itemsPrice * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    // Cap discount at total items price
    discount = Math.min(discount, itemsPrice);
    itemsPrice -= discount;

    // Increment coupon used count
    coupon.usedCount += 1;
    await coupon.save();
  }

  // Calculate Tax (e.g. 5% GST) and Shipping (Rs 50 if below Rs 500, else free)
  const taxPrice = Math.round(itemsPrice * 0.05 * 100) / 100;
  const shippingPrice = itemsPrice >= 500 || paymentMethod === PAYMENT_METHODS.COD ? 0 : 50;
  const totalAmount = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

  // 6. Execute stock deduction
  await Promise.all(stockUpdatePromises);

  // 7. Create Order document
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: resolvedAddress,
    paymentMethod,
    paymentInfo: {
      id: paymentMethod === PAYMENT_METHODS.COD ? `COD-${Date.now()}` : undefined,
      status: paymentMethod === PAYMENT_METHODS.COD ? 'pending' : 'created',
    },
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalAmount,
    status: ORDER_STATUS.PENDING,
  });

  // 8. Empty the user's cart
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  return order;
};
