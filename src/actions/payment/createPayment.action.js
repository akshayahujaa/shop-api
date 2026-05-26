import getRazorpayInstance from '../../config/payment.config.js';
import Order from '../../models/order.model.js';
import Payment from '../../models/payment.model.js';
import { ApiError } from '../../utils/apiError.js';
import { PAYMENT_STATUS } from '../../utils/constants.js';

/**
 * Action to create a Razorpay order session.
 * Saves the payment record as 'created'.
 * @param {string} orderId - The system order ID
 * @param {string} userId - ID of the user paying
 * @returns {Promise<Object>} Object containing Razorpay credentials, amount, and order ID
 */
export const createPaymentAction = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (order.paymentMethod === 'cod') {
    throw new ApiError(400, 'Cash on Delivery orders do not require online payment.');
  }

  let razorpay;
  try {
    razorpay = getRazorpayInstance();
  } catch (error) {
    throw new ApiError(500, 'Failed to initialize payment gateway. Check keys.');
  }

  // Razorpay amounts are represented in Paise (1 INR = 100 Paise)
  const amountPaise = Math.round(order.totalAmount * 100);

  const options = {
    amount: amountPaise,
    currency: 'INR',
    receipt: `receipt_order_${order._id}`,
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record
    await Payment.create({
      order: order._id,
      user: userId,
      razorpay_order_id: razorpayOrder.id,
      amount: order.totalAmount,
      status: PAYMENT_STATUS.CREATED,
    });

    return {
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      orderId: order._id,
    };
  } catch (error) {
    console.error(`❌ Razorpay Order creation failed: ${error.message}`);
    throw new ApiError(500, `Payment session could not be created: ${error.message}`);
  }
};
