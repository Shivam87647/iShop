import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { ORDER_STATUS } from '../constants/index.js';
import { badRequest, notFound, conflict } from '../utils/AppError.js';
import { resolveProduct } from './product.service.js';

export const createReview = async (userId, productSlug, { rating, title, body }) => {
  const product = await resolveProduct(productSlug);

  const existing = await Review.findOne({ product: product._id, user: userId });
  if (existing) throw conflict('You have already reviewed this product');

  const hasPurchased = await Order.exists({
    user: userId,
    status: { $in: [ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPED, ORDER_STATUS.CONFIRMED] },
    'items.product': product._id,
  });

  const review = await Review.create({
    product: product._id,
    user: userId,
    rating,
    title,
    body,
    isVerifiedPurchase: Boolean(hasPurchased),
  });

  await product.recalculateRating();
  return review.populate('user', 'name avatar');
};

export const getProductReviews = async (productSlug, { page = 1, limit = 10 }) => {
  const product = await Product.findOne({ slug: productSlug });
  if (!product) throw notFound('Product');

  const skip = (page - 1) * limit;
  const filter = { product: product._id, isApproved: true };

  const [reviews, total, stats] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: stats.find((s) => s._id === star)?.count || 0,
  }));

  return {
    reviews,
    ratingsAverage: product.ratingsAverage,
    ratingsCount: product.ratingsCount,
    distribution,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

export const deleteReview = async (reviewId, userId, isAdmin) => {
  const review = await Review.findById(reviewId);
  if (!review) throw notFound('Review');
  if (!isAdmin && !review.user.equals(userId)) throw badRequest('Not allowed');

  const productId = review.product;
  await review.deleteOne();

  const product = await Product.findById(productId);
  if (product) await product.recalculateRating();

  return { deleted: true };
};

export const moderateReview = async (reviewId, isApproved) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { isApproved },
    { new: true }
  );
  if (!review) throw notFound('Review');

  const product = await Product.findById(review.product);
  if (product) await product.recalculateRating();

  return review;
};
