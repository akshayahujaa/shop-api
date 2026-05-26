import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import { cancelOrderAction } from '../actions/order/cancelOrder.action.js';
import Order from '../models/order.model.js';

dotenv.config();

const test = async () => {
  await connectDB();
  try {
    const orderId = '6a15668c5da7bfc94d4f1319';
    const order = await Order.findById(orderId);
    console.log('Order found:', order);
    if (!order) {
      console.log('Order not found in DB!');
      process.exit(0);
    }
    const user = { id: order.user.toString(), role: 'user' };
    const res = await cancelOrderAction(orderId, 'Testing cancellation', user);
    console.log('Cancelled order successfully:', res);
  } catch (err) {
    console.error('Error during cancellation:', err);
  }
  process.exit(0);
};

test();
