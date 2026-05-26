import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import { generateAccessToken } from '../utils/token.util.js';
import axios from 'axios';

dotenv.config();

const test = async () => {
  await connectDB();
  try {
    // 1. Find an order that is pending
    const order = await Order.findOne({ status: 'pending' });
    if (!order) {
      console.log('No pending order found to cancel.');
      process.exit(0);
    }
    console.log('Testing cancellation on order:', order._id, 'user:', order.user);

    // 2. Fetch the user who owns the order
    const user = await User.findById(order.user);
    if (!user) {
      console.log('User not found in DB!');
      process.exit(0);
    }

    // 3. Generate token
    const token = generateAccessToken(user._id.toString(), user.role);
    console.log('Generated token:', token);

    // 4. Send request to backend
    const url = `http://localhost:5000/api/v1/orders/${order._id}/cancel`;
    console.log(`Sending PUT request to: ${url}`);
    const response = await axios.put(url, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (err) {
    if (err.response) {
      console.error('Request failed with response:', err.response.status, err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  }
  process.exit(0);
};

test();
