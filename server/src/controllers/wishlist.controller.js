import * as wishlistService from '../services/wishlist.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const data = await wishlistService.getWishlist(req.user._id);
  sendSuccess(res, { data });
});

export const add = asyncHandler(async (req, res) => {
  const ref = req.body.productSlug || req.body.productId;
  const data = await wishlistService.addToWishlist(req.user._id, ref);
  sendSuccess(res, { message: 'Added to wishlist', data });
});

export const remove = asyncHandler(async (req, res) => {
  const ref = req.params.productSlug || req.body.productSlug || req.body.productId;
  const data = await wishlistService.removeFromWishlist(req.user._id, ref);
  sendSuccess(res, { message: 'Removed from wishlist', data });
});

export const toggle = asyncHandler(async (req, res) => {
  const ref = req.body.productSlug || req.body.productId;
  const data = await wishlistService.toggleWishlist(req.user._id, ref);
  sendSuccess(res, { data });
});
