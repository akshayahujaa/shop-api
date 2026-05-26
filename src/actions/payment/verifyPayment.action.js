import crypto from 'crypto';
import Payment from '../../models/payment.model.js';
import Order from '../../models/order.model.js';
import { ApiError } from '../../utils/apiError.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../../utils/constants.js';

/**
 * Action to verify Razorpay signatures.
 * Marks the payment as 'paid' and order as 'processing' upon success.
 * @param {Object} verificationData - Signature tokens from client
 * @param {string} userId - User paying
 * @returns {Promise<Object>} Object containing verification status
 */
export const verifyPaymentAction = async (verificationData, userId) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = verificationData;

  // 1. Verify signatures locally using HMAC SHA256
  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret')
    .update(text)
    .digest('hex');

  const isSignatureValid = generatedSignature === razorpay_signature;

  if (!isSignatureValid) {
    // Log failure and update payment status
    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      { $set: { status: PAYMENT_STATUS.FAILED, razorpay_payment_id, razorpay_signature } }
    );
    throw new ApiError(400, 'Payment signature verification failed.');
  }

  // 2. Fetch system payment record
  const payment = await Payment.findOne({ razorpay_order_id, user: userId });
  if (!payment) {
    throw new ApiError(404, 'Payment record not found.');
  }

  // 3. Update payment status to paid
  payment.status = PAYMENT_STATUS.PAID;
  payment.razorpay_payment_id = razorpay_payment_id;
  payment.razorpay_signature = razorpay_signature;
  await payment.save();

  // 4. Update system order status and payment status
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order associated with payment not found.');
  }

  order.paymentInfo.status = 'paid';
  order.paymentInfo.id = razorpay_payment_id;
  order.status = ORDER_STATUS.PROCESSING; // Move from pending to processing once paid
  await order.save();

  return {
    verified: true,
    orderId: order._id,
  };
};
