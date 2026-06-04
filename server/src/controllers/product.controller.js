import * as productService from '../services/product.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query, req.user?._id);
  sendSuccess(res, { data: result.products, meta: result.meta });
});

export const getProduct = asyncHandler(async (req, res) => {
  const result = await productService.getProductBySlug(req.params.slug);
  sendSuccess(res, { data: result });
});

export const getFeatured = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '3', 10);
  const products = await productService.getFeaturedProducts(limit);
  sendSuccess(res, { data: products });
});

export const getTrending = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '8', 10);
  const products = await productService.getTrendingProducts(limit);
  sendSuccess(res, { data: products });
});

export const getHomeCollections = asyncHandler(async (_req, res) => {
  const [featured, topRated, specialOffers, trending] = await Promise.all([
    productService.getFeaturedProducts(3),
    productService.getTopRatedProducts(3),
    productService.getSpecialOffers(3),
    productService.getTrendingProducts(8),
  ]);
  sendSuccess(res, {
    data: { featured, topRated, specialOffers, trending },
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user._id);
  sendCreated(res, product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, { message: 'Product updated', data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  sendSuccess(res, { message: 'Product deactivated' });
});

export const updateInventory = asyncHandler(async (req, res) => {
  const product = await productService.updateInventory(req.params.id, req.body.variants);
  sendSuccess(res, { data: product });
});
