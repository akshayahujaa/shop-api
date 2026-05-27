import jwt from 'jsonwebtoken';
import appConfig from '../config/app.config.js';

/**
 * Generate an access token with userId and role.
 * Short-lived (15 minutes by default).
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    appConfig.jwt.accessSecret,
    { expiresIn: appConfig.jwt.accessExpiry }
  );
};

/**
 * Generate a refresh token with userId.
 * Long-lived (7 days by default), stored in HTTP-only cookie.
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    appConfig.jwt.refreshSecret,
    { expiresIn: appConfig.jwt.refreshExpiry }
  );
};

/**
 * Verify an access token.
 * Returns decoded payload or throws on invalid/expired.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, appConfig.jwt.accessSecret);
};

/**
 * Verify a refresh token.
 * Returns decoded payload or throws on invalid/expired.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, appConfig.jwt.refreshSecret);
};

/**
 * Set refresh token as HTTP-only, Secure, SameSite cookie.
 */
const setRefreshTokenCookie = (res, token) => {
  const isProduction = appConfig.nodeEnv === 'production';

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  });
};

/**
 * Clear the refresh token cookie on logout.
 */
const clearRefreshTokenCookie = (res) => {
  const isProduction = appConfig.nodeEnv === 'production';

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
