/**
 * Async handler wrapper to eliminate try-catch boilerplate in controllers.
 * Catches any errors and passes them to the next middleware (error handler).
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { asyncHandler };
