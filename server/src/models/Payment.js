import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/index.js';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['mock', 'stripe', 'razorpay'],
      default: 'mock',
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    providerPaymentId: String,
    providerClientSecret: String,
    idempotencyKey: { type: String, unique: true, sparse: true },
    metadata: mongoose.Schema.Types.Mixed,
    failureReason: String,
    capturedAt: Date,
    refundedAt: Date,
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
