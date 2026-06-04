import * as reviewService from '../services/review.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const listReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(req.params.slug, req.query);
  sendSuccess(res, {
    data: {
      reviews: result.reviews,
      ratingsAverage: result.ratingsAverage,
      ratingsCount: result.ratingsCount,
      distribution: result.distribution,
    },
    meta: result.meta,
  });
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.user._id,
    req.params.slug,
    req.body
  );
  sendCreated(res, review);
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(
    req.params.reviewId,
    req.user._id,
    req.user.role === 'admin'
  );
  sendSuccess(res, { message: 'Review deleted' });
});

export const moderateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.moderateReview(
    req.params.reviewId,
    req.body.isApproved
  );
  sendSuccess(res, { data: review });
});
