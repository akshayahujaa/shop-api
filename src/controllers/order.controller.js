import { createOrderAction } from '../actions/order/createOrder.action.js';
import { getOrdersAction } from '../actions/order/getOrders.action.js';
import { getOrderByIdAction } from '../actions/order/getOrderById.action.js';
import { updateOrderStatusAction } from '../actions/order/updateOrderStatus.action.js';
import { cancelOrderAction } from '../actions/order/cancelOrder.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await createOrderAction(req.user.id, req.body);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Order placed successfully.',
    data: order,
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const result = await getOrdersAction(req.query, req.user);

  return ApiResponse.success(res, {
    message: 'Orders fetched successfully.',
    data: result.data,
    pagination: result.pagination,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await getOrderByIdAction(req.params.id, req.user);

  return ApiResponse.success(res, {
    message: 'Order details fetched successfully.',
    data: order,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await updateOrderStatusAction(req.params.id, status);

  return ApiResponse.success(res, {
    message: 'Order status updated successfully.',
    data: order,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await cancelOrderAction(req.params.id, reason, req.user);

  return ApiResponse.success(res, {
    message: 'Order cancelled successfully.',
    data: order,
  });
});
