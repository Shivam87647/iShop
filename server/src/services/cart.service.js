import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import config from '../config/index.js';
import { badRequest, notFound } from '../utils/AppError.js';
import { resolveProduct } from './product.service.js';
import { toPublicProduct } from '../utils/productMapper.js';

const findVariant = (product, { variantId, selectedColor }) => {
  if (variantId) {
    return product.variants.id(variantId);
  }
  if (selectedColor) {
    return product.variants.find(
      (v) => v.color?.name?.toLowerCase() === selectedColor.toLowerCase()
    );
  }
  return product.variants?.[0];
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    populate: { path: 'category', select: 'slug' },
  });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate({
      path: 'items.product',
      populate: { path: 'category', select: 'slug' },
    });
  }
  return cart;
};

const calculateTotals = async (cart) => {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  let discountAmount = 0;
  let coupon = null;
  if (cart.couponCode) {
    coupon = await Coupon.findOne({ code: cart.couponCode, isActive: true });
    if (coupon?.isValid(subtotal)) {
      discountAmount = coupon.calculateDiscount(subtotal);
    }
  }

  const shippingCost =
    subtotal === 0 || subtotal >= config.commerce.freeShippingThreshold
      ? 0
      : config.commerce.defaultShippingCost;

  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  return {
    subtotal,
    shippingCost,
    discountAmount,
    couponCode: coupon ? cart.couponCode : null,
    total,
    itemCount: cart.items.reduce((n, i) => n + i.quantity, 0),
  };
};

const formatCartResponse = async (cart) => {
  const totals = await calculateTotals(cart);
  const items = cart.items.map((item) => ({
    _id: item._id,
    quantity: item.quantity,
    selectedColor: item.selectedColor,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
    product: item.product ? toPublicProduct(item.product) : null,
  }));

  return { items, ...totals };
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return formatCartResponse(cart);
};

export const addToCart = async (userId, { productId, productSlug, variantId, quantity, selectedColor }) => {
  const product = await resolveProduct(productSlug || productId);
  const variant = findVariant(product, { variantId, selectedColor });
  const colorName = selectedColor || variant?.color?.name || product.variants?.[0]?.color?.name;

  if (product.totalStock <= 0) throw badRequest('Product is out of stock');

  const cart = await getOrCreateCart(userId);
  const unitPrice = variant?.price ?? product.price;
  const existing = cart.items.find(
    (item) =>
      item.product._id.equals(product._id) &&
      (item.selectedColor || '') === (colorName || '')
  );

  const newQty = (existing?.quantity || 0) + quantity;
  const stockAvailable = variant?.stock ?? product.totalStock;
  if (newQty > stockAvailable) {
    throw badRequest(`Only ${stockAvailable} units available`);
  }

  if (existing) {
    existing.quantity = newQty;
  } else {
    cart.items.push({
      product: product._id,
      variant: variant?._id,
      quantity,
      selectedColor: colorName,
      unitPrice,
    });
  }

  await cart.save();
  return getCart(userId);
};

export const updateCartItem = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) throw notFound('Cart item');

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    const product = await resolveProduct(item.product._id);
    const variant = item.variant ? product.variants.id(item.variant) : null;
    const stock = variant?.stock ?? product.totalStock;
    if (quantity > stock) throw badRequest(`Only ${stock} units available`);
    item.quantity = quantity;
  }

  await cart.save();
  return getCart(userId);
};

export const removeFromCart = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) throw notFound('Cart item');
  item.deleteOne();
  await cart.save();
  return getCart(userId);
};

export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { items: [], couponCode: null });
  return getCart(userId);
};

export const applyCoupon = async (userId, code) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw badRequest('Invalid coupon code');

  const cart = await getOrCreateCart(userId);
  const totals = await calculateTotals({ ...cart.toObject(), couponCode: null });
  if (!coupon.isValid(totals.subtotal)) {
    throw badRequest('Coupon cannot be applied to this cart');
  }

  cart.couponCode = coupon.code;
  await cart.save();
  return getCart(userId);
};

export const removeCoupon = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { couponCode: null });
  return getCart(userId);
};
