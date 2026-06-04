import mongoose from 'mongoose';
import slugify from 'slugify';
import { PRODUCT_BADGES } from '../constants/index.js';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, sparse: true },
    color: colorSchema,
    size: { type: String, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    badge: { type: String, enum: PRODUCT_BADGES },
    images: [imageSchema],
    specs: [specSchema],
    variants: [variantSchema],
    featured: { type: Boolean, default: false, index: true },
    trending: { type: Boolean, default: false, index: true },
    trendingScore: { type: Number, default: 0 },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    totalStock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ ratingsAverage: -1 });
productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ featured: 1, trending: 1 });

productSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.pre('save', function computeStock(next) {
  if (this.variants?.length) {
    this.totalStock = this.variants
      .filter((v) => v.isActive !== false)
      .reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  next();
});

productSchema.methods.recalculateRating = async function recalculateRating() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: this._id, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length) {
    this.ratingsAverage = Math.round(stats[0].avg * 10) / 10;
    this.ratingsCount = stats[0].count;
  } else {
    this.ratingsAverage = 0;
    this.ratingsCount = 0;
  }
  await this.save({ validateBeforeSave: false });
};

const Product = mongoose.model('Product', productSchema);
export default Product;
