import User from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to activate or deactivate a user (Admin only).
 * @param {string} userId - Target user ID
 * @param {boolean} isActive - Status flag
 * @returns {Promise<Object>} Updated user
 */
export const toggleUserStatusAction = async (userId, isActive) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  user.isActive = isActive;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return userObj;
};
