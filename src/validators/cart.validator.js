import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const addToCartSchema = Joi.object({
  product: Joi.string().pattern(objectIdPattern).required().messages({
    'string.empty': 'Product ID is required',
    'string.pattern.base': 'Invalid product ID format',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.base': 'Quantity must be a valid integer',
  }),
});

export const updateCartItemSchema = Joi.object({
  product: Joi.string().pattern(objectIdPattern).required().messages({
    'string.empty': 'Product ID is required',
    'string.pattern.base': 'Invalid product ID format',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.base': 'Quantity must be a valid integer',
  }),
});
