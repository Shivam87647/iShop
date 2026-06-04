import * as cartService from '../services/cart.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  sendSuccess(res, { data: cart });
});

export const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addToCart(req.user._id, req.body);
  sendSuccess(res, { message: 'Item added to cart', data: cart });
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItem(
    req.user._id,
    req.params.itemId,
    req.body.quantity
  );
  sendSuccess(res, { data: cart });
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user._id, req.params.itemId);
  sendSuccess(res, { data: cart });
});

export const clear = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  sendSuccess(res, { message: 'Cart cleared', data: cart });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const cart = await cartService.applyCoupon(req.user._id, req.body.code);
  sendSuccess(res, { message: 'Coupon applied', data: cart });
});

export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCoupon(req.user._id);
  sendSuccess(res, { data: cart });
});
