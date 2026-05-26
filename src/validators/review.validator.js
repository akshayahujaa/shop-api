import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createReviewSchema = Joi.object({
  product: Joi.string().pattern(objectIdPattern).required().messages({
    'string.empty': 'Product ID is required',
    'string.pattern.base': 'Invalid product ID format',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be an integer between 1 and 5',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
  }),
  comment: Joi.string().max(1000).optional().allow('', null).messages({
    'string.max': 'Comment cannot exceed 1000 characters',
  }),
  images: Joi.array().items(Joi.string().uri()).max(5).optional(),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().max(1000).optional().allow('', null),
  images: Joi.array().items(Joi.string().uri()).max(5).optional(),
});
