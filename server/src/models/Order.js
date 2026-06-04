import mongoose from 'mongoose';
import { ORDER_STATUS } from '../constants/index.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: mongoose.Schema.Types.ObjectId,
    name: String,
    slug: String,
    image: String,
    selectedColor: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'US' },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    note: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    couponCode: String,
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    statusHistory: [statusHistorySchema],
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    cancelledAt: Date,
    cancelReason: String,
    deliveredAt: Date,
    notes: String,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.pre('save', async function generateOrderNumber(next) {
  if (this.orderNumber) return next();
  const count = await mongoose.model('Order').countDocuments();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  this.orderNumber = `ISH-${datePart}-${String(count + 1).padStart(5, '0')}`;
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
