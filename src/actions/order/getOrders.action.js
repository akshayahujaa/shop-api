import Order from '../../models/order.model.js';
import { paginateQuery } from '../../utils/pagination.util.js';

/**
 * Action to retrieve paginated orders.
 * Admins/Sellers can view all orders, users view only their own.
 * @param {Object} queryParams - Express query parameters (page, limit, status)
 * @param {Object} currentUser - The current user details (id, role)
 * @returns {Promise<Object>} Paginated orders list and meta data
 */
export const getOrdersAction = async (queryParams, currentUser) => {
  const { page, limit, status } = queryParams;

  const filter = {};

  // If user, restrict to their own orders. Admins and Sellers can see all.
  if (currentUser.role === 'user') {
    filter.user = currentUser.id;
  }

  // Filter by status if specified
  if (status) {
    filter.status = status;
  }

  const result = await paginateQuery(Order, filter, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: { path: 'user', select: 'name email' },
  });

  return result;
};
