import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'Product name is required',
    'string.min': 'Product name must be at least 3 characters',
    'string.max': 'Product name cannot exceed 200 characters',
  }),
  description: Joi.string().min(10).max(5000).required().messages({
    'string.empty': 'Product description is required',
    'string.min': 'Product description must be at least 10 characters',
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be a positive number',
  }),
  discountPrice: Joi.number().positive().less(Joi.ref('price')).optional().messages({
    'number.less': 'Discount price must be less than the original price',
  }),
  images: Joi.array().items(Joi.string().uri()).min(1).max(5).required().messages({
    'array.min': 'At least one image is required',
    'array.max': 'You can upload up to 5 images only',
  }),
  category: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid category ID format',
    'string.empty': 'Product category is required',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Stock cannot be negative',
    'number.base': 'Stock must be an integer',
  }),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(5000).optional(),
  price: Joi.number().positive().optional(),
  discountPrice: Joi.number().positive().less(Joi.ref('price')).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).max(5).optional(),
  category: Joi.string().pattern(objectIdPattern).optional(),
  stock: Joi.number().integer().min(0).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  isActive: Joi.boolean().optional(),
});

export const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Category name is required',
  }),
  parent: Joi.string().pattern(objectIdPattern).optional().allow('', null),
  description: Joi.string().max(500).optional().allow('', null),
  image: Joi.string().uri().optional().allow('', null),
});
