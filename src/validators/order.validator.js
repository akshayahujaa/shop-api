import Joi from 'joi';
import { PAYMENT_METHODS, ORDER_STATUS } from '../utils/constants.js';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const shippingAddressSchema = Joi.object({
  fullName: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  country: Joi.string().required(),
});

export const createOrderSchema = Joi.object({
  addressId: Joi.string().pattern(objectIdPattern).optional().messages({
    'string.pattern.base': 'Invalid address ID format',
  }),
  shippingAddress: shippingAddressSchema.when('addressId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  paymentMethod: Joi.string()
    .valid(...Object.values(PAYMENT_METHODS))
    .required()
    .messages({
      'any.only': `Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`,
    }),
  couponCode: Joi.string().trim().uppercase().optional().allow('', null),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .required()
    .messages({
      'any.only': `Order status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`,
    }),
});
