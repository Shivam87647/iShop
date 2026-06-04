import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../constants/index.js';
import config from '../config/index.js';
import { badRequest, notFound } from '../utils/AppError.js';

export const createPaymentIntent = async ({ order, userId, method, idempotencyKey }) => {
  const key =
    idempotencyKey ||
    crypto.createHash('sha256').update(`${order._id}-${userId}`).digest('hex');

  const existing = await Payment.findOne({ idempotencyKey: key });
  if (existing) return existing;

  const provider = method === 'stripe' && config.payment.stripeSecretKey ? 'stripe' : 'mock';

  const payment = await Payment.create({
    order: order._id,
    user: userId,
    provider,
    amount: order.total,
    currency: 'USD',
    status: PAYMENT_STATUS.PENDING,
    idempotencyKey: key,
    providerClientSecret:
      provider === 'mock'
        ? `mock_secret_${order.orderNumber}`
        : undefined,
    metadata: { orderNumber: order.orderNumber },
  });

  return payment;
};

export const verifyPayment = async ({ paymentId, providerPaymentId, userId }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw notFound('Payment');
  if (!payment.user.equals(userId)) throw badRequest('Payment does not belong to user');

  if (payment.status === PAYMENT_STATUS.CAPTURED) {
    return payment;
  }

  if (payment.provider === 'stripe') {
    if (!providerPaymentId) throw badRequest('providerPaymentId required for Stripe');
    // Stripe SDK integration point:
    // const intent = await stripe.paymentIntents.retrieve(providerPaymentId);
    // if (intent.status !== 'succeeded') throw badRequest('Payment not completed');
    payment.providerPaymentId = providerPaymentId;
  } else {
    payment.providerPaymentId = providerPaymentId || `mock_pi_${Date.now()}`;
  }

  payment.status = PAYMENT_STATUS.CAPTURED;
  payment.capturedAt = new Date();
  await payment.save();

  const order = await Order.findById(payment.order);
  if (order && order.status === ORDER_STATUS.PENDING) {
    order.status = ORDER_STATUS.CONFIRMED;
    order.statusHistory.push({
      status: ORDER_STATUS.CONFIRMED,
      note: 'Payment captured',
      changedAt: new Date(),
    });
    order.payment = payment._id;
    await order.save();
  }

  return payment;
};

export const handleStripeWebhook = async (_rawBody, _signature) => {
  if (!config.payment.stripeWebhookSecret) {
    throw badRequest('Stripe webhook not configured');
  }
  // const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  // switch (event.type) { ... }
  return { received: true };
};

export const getPaymentByOrder = async (orderId, userId) => {
  const payment = await Payment.findOne({ order: orderId, user: userId });
  if (!payment) throw notFound('Payment');
  return payment;
};
