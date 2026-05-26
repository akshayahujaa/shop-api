import { ApiError } from '../utils/apiError.js';

/**
 * Express middleware to validate request data against a Joi schema.
 * Supports validating req.body, req.query, or req.params.
 * @param {Object} schema - Joi schema object
 * @param {string} [property='body'] - The request property to validate ('body', 'query', 'params')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true, // removes unvalidated fields for security
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(new ApiError(400, 'Validation failed', errorMessages));
    }

    // Replace the request data with the validated and sanitized value
    req[property] = value;
    next();
  };
};
