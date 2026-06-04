import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import config from '../config/index.js';
import { ORDER_STATUS } from '../constants/index.js';
import { badRequest, notFound, forbidden } from '../utils/AppError.js';
import { getCart, clearCart } from './cart.service.js';
import { createPaymentIntent, verifyPayment } from './payment.service.js';
import { sendOrderConfirmationEmail } from './email.service.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
];

const reserveInventory = async (items, session) => {
  for (const item of items) {
    const product = await Product.findById(item.product).session(session);
    if (!product) throw badRequest(`Product not found: ${item.product}`);

    if (item.variant) {
      const variant = product.variants.id(item.variant);
      if (!variant || variant.stock < item.quantity) {
        throw badRequest(`Insufficient stock for ${product.name}`);
      }
      variant.stock -= item.quantity;
    } else if (product.totalStock < item.quantity) {
      throw badRequest(`Insufficient stock for ${product.name}`);
    } else if (product.variants?.length) {
      const variant = product.variants.find(
        (v) => v.color?.name === item.selectedColor
      ) || product.variants[0];
      if (!variant || variant.stock < item.quantity) {
        throw badRequest(`Insufficient stock for ${product.name}`);
      }
      variant.stock -= item.quantity;
    }

    await product.save({ session });
  }
};

const releaseInventory = async (items, session) => {
  for (const item of items) {
    const product = await Product.findById(item.product).session(session);
    if (!product) continue;

    if (item.variant) {
      const variant = product.variants.id(item.variant);
      if (variant) variant.stock += item.quantity;
    } else if (product.variants?.length) {
      const variant = product.variants.find(
        (v) => v.color?.name === item.selectedColor
      );
      if (variant) variant.stock += item.quantity;
    }
    await product.save({ session });
  }
};

const runWithTransaction = async (fn) => {
  const isStandalone = mongoose.connection.client?.topology?.description?.type === 'Single';
  if (isStandalone) {
    return fn(null);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const createOrderFromCart = async (userId, payload) => {
  return runWithTransaction(async (session) => {
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .session(session);

    if (!cart?.items?.length) throw badRequest('Cart is empty');

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product?.isActive) throw badRequest(`Product unavailable: ${product?.name}`);

      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        product: product._id,
        variant: item.variant,
        name: product.name,
        slug: product.slug,
        image:
          product.images?.find((i) => i.isPrimary)?.url ||
          product.images?.[0]?.url ||
          '',
        selectedColor: item.selectedColor,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
      });
    }

    let discountAmount = 0;
    const couponCode = (payload.couponCode || cart.couponCode)?.toUpperCase();
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode }).session(session);
      if (!coupon?.isValid(subtotal)) throw badRequest('Invalid or expired coupon');
      discountAmount = coupon.calculateDiscount(subtotal);
      coupon.usedCount += 1;
      await coupon.save({ session });
    }

    const shippingCost =
      subtotal >= config.commerce.freeShippingThreshold
        ? 0
        : config.commerce.defaultShippingCost;

    const total = Math.max(0, subtotal + shippingCost - discountAmount);

    await reserveInventory(
      orderItems.map((i) => ({
        product: i.product,
        variant: i.variant,
        quantity: i.quantity,
        selectedColor: i.selectedColor,
      })),
      session
    );

    const order = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          shippingAddress: payload.shippingAddress,
          couponCode,
          subtotal,
          shippingCost,
          discountAmount,
          total,
          status: ORDER_STATUS.PENDING,
          statusHistory: [{ status: ORDER_STATUS.PENDING, note: 'Order placed' }],
          notes: payload.notes,
        },
      ],
      { session }
    );

    const created = order[0];
    const payment = await createPaymentIntent({
      order: created,
      userId,
      method: payload.paymentMethod,
      idempotencyKey: payload.idempotencyKey,
    });

    created.payment = payment._id;
    await created.save({ session });

    cart.items = [];
    cart.couponCode = undefined;
    await cart.save({ session });

    const user = await User.findById(userId);
    if (user) {
      sendOrderConfirmationEmail(user, created).catch((err) => {
        logger.error('Failed to send order confirmation email', { error: err.message, orderId: created._id });
      });
    }

    return {
      order: created,
      payment,
      clientSecret: payment.providerClientSecret,
    };
  });
};

export const confirmOrderPayment = async (userId, paymentPayload) => {
  const payment = await verifyPayment({ ...paymentPayload, userId });
  const order = await Order.findById(payment.order).populate('items.product');
  return { order, payment };
};

export const getUserOrders = async (userId, { page = 1, limit = 10, status }) => {
  const filter = { user: userId };
  if (status) filter.status = status;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

export const getOrderById = async (orderId, userId, isAdmin = false) => {
  const order = await Order.findById(orderId).populate('payment');
  if (!order) throw notFound('Order');
  if (!isAdmin && !order.user.equals(userId)) throw forbidden();
  return order;
};

export const cancelOrder = async (orderId, userId, reason) => {
  return runWithTransaction(async (session) => {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw notFound('Order');
    if (!order.user.equals(userId)) throw forbidden();
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw badRequest('Order cannot be cancelled at this stage');
    }

    await releaseInventory(order.items, session);

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,
      note: reason || 'Cancelled by customer',
      changedAt: new Date(),
    });
    await order.save({ session });
    return order;
  });
};

export const updateOrderStatus = async (orderId, adminId, { status, note }) => {
  const order = await Order.findById(orderId);
  if (!order) throw notFound('Order');

  order.status = status;
  order.statusHistory.push({
    status,
    note,
    changedBy: adminId,
    changedAt: new Date(),
  });

  if (status === ORDER_STATUS.DELIVERED) order.deliveredAt = new Date();
  await order.save();
  await order.populate('user', 'name email');
  return order;
};

export const listAllOrders = async ({ page = 1, limit = 20, status }) => {
  const filter = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};
