import User from '../../models/user.model.js';
import { paginateQuery } from '../../utils/pagination.util.js';

/**
 * Action to retrieve paginated users (Admin only).
 * Supports searching by name/email, and filtering by role.
 * @param {Object} queryParams - page, limit, role, search
 * @returns {Promise<Object>} Paginated users
 */
export const getUsersAction = async ({ page, limit, role, search }) => {
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
    ];
  }

  const result = await paginateQuery(User, filter, {
    page,
    limit,
    sort: { createdAt: -1 },
    select: '-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry',
  });

  return result;
};
