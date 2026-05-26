import User from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.util.js';

/**
 * Business action to log in a user.
 * Validates credentials, updates refresh token, and returns user details + tokens.
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} Object containing user details and access/refresh tokens
 */
export const loginAction = async ({ email, password }) => {
  // 1. Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.isActive === false) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
  }

  // 2. Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // 3. Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // 4. Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // 5. Return user details (omit password) and tokens
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};
