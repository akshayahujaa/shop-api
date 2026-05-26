import User from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to retrieve a user profile by ID.
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The user profile object
 */
export const getProfileAction = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry');
  
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  return user;
};
