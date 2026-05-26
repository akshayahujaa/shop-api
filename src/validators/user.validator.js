import Joi from 'joi';

// Custom MongoDB ObjectId helper
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits',
    }),
  avatar: Joi.string().uri().optional().allow('', null),
});

export const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 8 characters',
      'string.pattern.base':
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    }),
});

export const addressSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Full name is required',
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits',
    }),
  street: Joi.string().required().messages({
    'string.empty': 'Street address is required',
  }),
  city: Joi.string().required().messages({
    'string.empty': 'City is required',
  }),
  state: Joi.string().required().messages({
    'string.empty': 'State is required',
  }),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.empty': 'Pincode is required',
      'string.pattern.base': 'Pincode must be exactly 6 digits',
    }),
  country: Joi.string().required().messages({
    'string.empty': 'Country is required',
  }),
  isDefault: Joi.boolean().optional(),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'seller', 'admin').required().messages({
    'any.only': 'Role must be user, seller, or admin',
    'string.empty': 'Role is required',
  }),
});

export const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive status is required',
  }),
});
