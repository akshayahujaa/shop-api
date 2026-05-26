import { createPaymentAction } from '../actions/payment/createPayment.action.js';
import { verifyPaymentAction } from '../actions/payment/verifyPayment.action.js';
import { refundPaymentAction } from '../actions/payment/refundPayment.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const paymentDetails = await createPaymentAction(orderId, req.user.id);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Razorpay payment session created successfully.',
    data: paymentDetails,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const result = await verifyPaymentAction(req.body, req.user.id);

  return ApiResponse.success(res, {
    message: 'Payment verified and order placed successfully.',
    data: result,
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const result = await refundPaymentAction(orderId);

  return ApiResponse.success(res, {
    message: 'Payment refunded successfully.',
    data: result,
  });
});
