import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function isValid(subtotal) {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  if (subtotal < this.minOrderAmount) return false;
  return true;
};

couponSchema.methods.calculateDiscount = function calculateDiscount(subtotal) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = subtotal * (this.discountValue / 100);
    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, subtotal);
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
