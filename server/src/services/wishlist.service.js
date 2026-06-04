import Wishlist from '../models/Wishlist.js';
import { notFound } from '../utils/AppError.js';
import { resolveProduct } from './product.service.js';
import { toPublicProductList } from '../utils/productMapper.js';

const getOrCreate = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

export const getWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: 'products',
    match: { isActive: true },
    populate: { path: 'category', select: 'slug' },
  });
  if (!wishlist) return { products: [], count: 0 };
  const products = toPublicProductList(wishlist.products.filter(Boolean));
  return { products, count: products.length, productIds: products.map((p) => p.id) };
};

export const addToWishlist = async (userId, productRef) => {
  const product = await resolveProduct(productRef);
  const wishlist = await getOrCreate(userId);
  if (!wishlist.products.some((id) => id.equals(product._id))) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }
  return getWishlist(userId);
};

export const removeFromWishlist = async (userId, productRef) => {
  const product = await resolveProduct(productRef);
  const wishlist = await getOrCreate(userId);
  wishlist.products = wishlist.products.filter((id) => !id.equals(product._id));
  await wishlist.save();
  return getWishlist(userId);
};

export const toggleWishlist = async (userId, productRef) => {
  const product = await resolveProduct(productRef);
  const wishlist = await getOrCreate(userId);
  const index = wishlist.products.findIndex((id) => id.equals(product._id));
  if (index > -1) {
    wishlist.products.splice(index, 1);
  } else {
    wishlist.products.push(product._id);
  }
  await wishlist.save();
  const isInWishlist = index === -1;
  return { ...(await getWishlist(userId)), isInWishlist };
};

export const clearWishlist = async (userId) => {
  await Wishlist.findOneAndUpdate({ user: userId }, { products: [] });
  return getWishlist(userId);
};
