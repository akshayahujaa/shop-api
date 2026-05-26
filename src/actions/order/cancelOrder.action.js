import Order from '../../models/order.model.js';
import Product from '../../models/product.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ORDER_STATUS } from '../../utils/constants.js';

/**
 * Action to cancel an order. Restores inventory stock.
 * Regular users can only cancel when order status is pending.
 * @param {string} orderId - Order ID to cancel
 * @param {string} reason - Reason for cancellation
 * @param {Object} currentUser - User executing cancellation (id, role)
 * @returns {Promise<Object>} The cancelled Order document
 */
export const cancelOrderAction = async (orderId, reason, currentUser) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Permission checks
  if (currentUser.role === 'user') {
    if (order.user.toString() !== currentUser.id) {
      throw new ApiError(403, 'Forbidden. You do not own this order.');
    }
    if (order.status !== ORDER_STATUS.PENDING) {
      throw new ApiError(400, 'Order can only be cancelled while status is pending.');
    }
  }

  if (order.status === ORDER_STATUS.DELIVERED) {
    throw new ApiError(400, 'Delivered orders cannot be cancelled.');
  }

  if (order.status === ORDER_STATUS.CANCELLED) {
    throw new ApiError(400, 'Order is already cancelled.');
  }

  // Restore product inventory stock in parallel
  const restoreStockPromises = order.items.map((item) =>
    Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
  );

  await Promise.all(restoreStockPromises);

  // Transition order status
  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = Date.now();
  order.cancellationReason = reason || 'User requested cancellation';
  order.paymentInfo.status = 'cancelled';

  await order.save();
  return order;
};
