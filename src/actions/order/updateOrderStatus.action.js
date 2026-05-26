import Order from '../../models/order.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ORDER_STATUS } from '../../utils/constants.js';

/**
 * Action to update order status (Admin/Seller only).
 * Sets deliveredAt timestamp if status is delivered.
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @returns {Promise<Object>} Updated Order document
 */
export const updateOrderStatusAction = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (order.status === ORDER_STATUS.DELIVERED) {
    throw new ApiError(400, 'Order has already been delivered and cannot be updated.');
  }

  if (order.status === ORDER_STATUS.CANCELLED) {
    throw new ApiError(400, 'Order is cancelled and cannot be updated.');
  }

  order.status = status;

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = Date.now();
    order.paymentInfo.status = 'paid'; // Assumes paid if delivered
  }

  await order.save();
  return order;
};
