import Order from '../../models/order.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to retrieve order details by ID.
 * Verifies if user has permission (is owner or admin/seller).
 * @param {string} orderId - Order ID to fetch
 * @param {Object} currentUser - User making request (id, role)
 * @returns {Promise<Object>} The Order document populated with user details
 */
export const getOrderByIdAction = async (orderId, currentUser) => {
  const order = await Order.findById(orderId).populate('user', 'name email');

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Permissions check: regular user can only view their own order
  if (currentUser.role === 'user' && order.user._id.toString() !== currentUser.id) {
    throw new ApiError(403, 'Forbidden. You do not have permission to view this order.');
  }

  return order;
};
