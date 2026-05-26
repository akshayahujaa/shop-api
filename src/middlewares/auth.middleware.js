import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import appConfig from '../config/app.config.js';
import User from '../models/user.model.js';

/**
 * Protect routes by checking for valid JWT token in Authorization header.
 * Attaches verified user details to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Get token from authorization header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback to cookies if available
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new ApiError(401, 'Access denied. No token provided.'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, appConfig.jwt.accessSecret);
    
    // Attach user payload
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token has expired. Please refresh.'));
    }
    return next(new ApiError(401, 'Invalid access token.'));
  }
};
