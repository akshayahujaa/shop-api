import User from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to update a user's role (Admin only).
 * @param {string} userId - Target user ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRoleAction = async (userId, role) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  user.role = role;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return userObj;
};
