import rateLimit from 'express-rate-limit';
import appConfig from '../config/app.config.js';

/**
 * General API rate limiter to prevent abuse and brute force.
 */
export const apiRateLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.max,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again after 1 minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for sensitive authentication endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.authMax,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many login or registration attempts. Please try again after 1 minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
