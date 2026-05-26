import User from '../../models/user.model.js';
import Cart from '../../models/cart.model.js';
import { ApiError } from '../../utils/apiError.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.util.js';

/**
 * Business action to register a new user.
 * Creates a user, creates an empty cart, and returns tokens + user profile.
 * @param {Object} userData - User registration fields
 * @returns {Promise<Object>} Object containing user details and access/refresh tokens
 */
export const registerAction = async (userData) => {
  const { name, email, password, phone, role } = userData;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists.');
  }

  // 2. Create the user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'user',
  });

  // 3. Create an empty cart for the user
  await Cart.create({
    user: user._id,
    items: [],
    totalAmount: 0,
  });

  // 4. Generate JWT tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // 5. Store refresh token in user document
  user.refreshToken = refreshToken;
  await user.save();

  // 6. Return user details (omit password) and tokens
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};
