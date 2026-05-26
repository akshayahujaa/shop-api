import User from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to update user profile fields.
 * @param {string} userId - The user ID
 * @param {Object} updateData - Fields to update (name, phone, avatar)
 * @returns {Promise<Object>} The updated user profile
 */
export const updateProfileAction = async (userId, updateData) => {
  const allowedUpdates = ['name', 'phone', 'avatar'];
  const sanitizedData = {};

  allowedUpdates.forEach((key) => {
    if (updateData[key] !== undefined) {
      sanitizedData[key] = updateData[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: sanitizedData },
    { new: true, runValidators: true }
  ).select('-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry');

  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  return user;
};

/**
 * Action to update user password.
 * @param {string} userId - The user ID
 * @param {string} oldPassword - The current password
 * @param {string} newPassword - The new password to set
 */
export const updatePasswordAction = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  // 1. Verify old password
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password.');
  }

  // 2. Set new password (pre-save hook hashes it)
  user.password = newPassword;
  await user.save();
};
