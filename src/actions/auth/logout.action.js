import User from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Business action to log out a user.
 * Clears the refresh token from the database.
 * @param {string} userId - The user ID
 */
export const logoutAction = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Clear refresh token
  user.refreshToken = undefined;
  await user.save();
};
