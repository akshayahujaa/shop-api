import getRazorpayInstance from '../../config/payment.config.js';
import Payment from '../../models/payment.model.js';
import Order from '../../models/order.model.js';
import { ApiError } from '../../utils/apiError.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../../utils/constants.js';

/**
 * Action to refund a paid online payment (Admin only).
 * Integrates with Razorpay refunds API.
 * @param {string} orderId - Order ID to refund
 * @returns {Promise<Object>} Refund response
 */
export const refundPaymentAction = async (orderId) => {
  const payment = await Payment.findOne({ order: orderId, status: PAYMENT_STATUS.PAID });
  if (!payment) {
    throw new ApiError(404, 'Paid payment record not found for this order.');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  let razorpay;
  try {
    razorpay = getRazorpayInstance();
  } catch (error) {
    throw new ApiError(500, 'Payment gateway not initialized.');
  }

  try {
    // Initiate refund via Razorpay SDK
    const refundResponse = await razorpay.payments.refund(payment.razorpay_payment_id, {
      amount: Math.round(payment.amount * 100), // full refund in paise
      notes: { reason: 'Admin cancelled order / initiated refund' },
    });

    // Update payment record
    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundId = refundResponse.id;
    payment.refundStatus = refundResponse.status;
    await payment.save();

    // Update order status
    order.paymentInfo.status = 'refunded';
    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    return {
      refunded: true,
      refundId: refundResponse.id,
      amount: payment.amount,
    };
  } catch (error) {
    console.error(`❌ Razorpay Refund failed: ${error.message}`);
    throw new ApiError(500, `Refund initiation failed: ${error.message}`);
  }
};
