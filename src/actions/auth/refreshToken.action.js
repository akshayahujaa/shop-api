import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/token.util.js';

/**
 * Business action to refresh access tokens.
 * Supports token rotation: issues a new access token and a new refresh token.
 * @param {string} incomingRefreshToken - Old refresh token from client cookies/body
 * @returns {Promise<Object>} Object containing new access and refresh tokens
 */
export const refreshTokenAction = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is missing.');
  }

  try {
    // 1. Verify token
    const decoded = verifyRefreshToken(incomingRefreshToken);

    // 2. Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'User associated with token not found.');
    }

    // 3. Detect token reuse / verify match in database
    if (user.refreshToken !== incomingRefreshToken) {
      // Clear refresh token if compromise detected (reuse of old rotated token)
      user.refreshToken = undefined;
      await user.save();
      throw new ApiError(401, 'Invalid refresh token. Session compromised.');
    }

    // 4. Generate new tokens (Rotation)
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // 5. Save new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }
};
