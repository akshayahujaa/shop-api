import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.empty': 'Order ID is required',
    'string.pattern.base': 'Invalid order ID format',
  }),
  razorpay_order_id: Joi.string().required().messages({
    'string.empty': 'Razorpay order ID is required',
  }),
  razorpay_payment_id: Joi.string().required().messages({
    'string.empty': 'Razorpay payment ID is required',
  }),
  razorpay_signature: Joi.string().required().messages({
    'string.empty': 'Razorpay signature is required',
  }),
});

export const createCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).required().uppercase().trim(),
  discountType: Joi.string().valid('flat', 'percent').required(),
  discountValue: Joi.number().positive().required(),
  minOrderAmount: Joi.number().min(0).optional(),
  maxUses: Joi.number().integer().min(1).optional(),
  expiryDate: Joi.date().greater('now').required(),
  isActive: Joi.boolean().optional(),
});
