import * as orderService from '../services/order.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const createOrder = asyncHandler(async (req, res) => {
  const result = await orderService.createOrderFromCart(req.user._id, req.body);
  sendCreated(res, {
    order: result.order,
    payment: result.payment,
    clientSecret: result.clientSecret,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const result = await orderService.confirmOrderPayment(req.user._id, req.body);
  sendSuccess(res, {
    message: 'Payment verified',
    data: result,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user._id, req.query);
  sendSuccess(res, { data: result.orders, meta: result.meta });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role === 'admin'
  );
  sendSuccess(res, { data: { order } });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user._id,
    req.body.reason
  );
  sendSuccess(res, { message: 'Order cancelled', data: { order } });
});

export const adminListOrders = asyncHandler(async (req, res) => {
  const result = await orderService.listAllOrders(req.query);
  sendSuccess(res, { data: result.orders, meta: result.meta });
});

export const adminUpdateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.user._id,
    req.body
  );
  sendSuccess(res, { message: 'Order status updated', data: { order } });
});
