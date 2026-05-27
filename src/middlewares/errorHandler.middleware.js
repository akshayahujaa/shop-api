import appConfig from '../config/app.config.js';

/**
 * Global centralized error handler middleware.
 * Formats operational and non-operational errors into a standard JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  console.error('Error handled:', err);

  // Mongoose duplicate key error (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Conflict. ${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field ${err.path}`;
  }

  // Joi/ValidationError (just in case they propagate)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    errors = Object.values(err.errors).map((e) => e.message);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: appConfig.nodeEnv === 'development' ? err.stack : undefined,
  });
};

/**
 * Fallback middleware for handling 404 (Not Found) routes.
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
  });
};
