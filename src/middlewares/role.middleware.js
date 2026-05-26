import { ApiError } from '../utils/apiError.js';

/**
 * Authorize roles for route access.
 * Checks req.user.role against permitted roles.
 * @param {...string} roles - The list of roles allowed to access the route
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required for this operation.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden. You do not have permission to perform this action.'));
    }

    next();
  };
};
