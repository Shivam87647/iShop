import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Wishlist from '../models/Wishlist.js';
import { notFound, badRequest } from '../utils/AppError.js';
import { toPublicProduct, toPublicProductList } from '../utils/productMapper.js';
import { SORT_OPTIONS } from '../constants/index.js';

const resolveCategoryFilter = async (categoryParam) => {
  if (!categoryParam || categoryParam === 'all') return null;
  const category = await Category.findOne({
    $or: [{ slug: categoryParam }, { _id: categoryParam }],
    isActive: true,
  });
  if (!category) return { _id: null };
  return category._id;
};

const buildSort = (sortKey) => {
  switch (sortKey) {
    case SORT_OPTIONS.PRICE_ASC:
      return { price: 1 };
    case SORT_OPTIONS.PRICE_DESC:
      return { price: -1 };
    case SORT_OPTIONS.RATING:
      return { ratingsAverage: -1, ratingsCount: -1 };
    case SORT_OPTIONS.NEWEST:
      return { createdAt: -1 };
    case SORT_OPTIONS.TRENDING:
      return { trendingScore: -1, trending: -1 };
    default:
      return { createdAt: -1 };
  }
};

export const listProducts = async (query, userId = null) => {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  const categoryId = await resolveCategoryFilter(query.category);
  if (categoryId) filter.category = categoryId;

  if (query.subcategory) {
    const sub = await Category.findOne({
      $or: [{ slug: query.subcategory }, { _id: query.subcategory }],
    });
    if (sub) filter.subcategory = sub._id;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  if (query.badge) filter.badge = query.badge;
  if (query.featured === 'true') filter.featured = true;
  if (query.trending === 'true') filter.trending = true;

  if (query.color && query.color !== 'all') {
    filter['variants.color.name'] = {
      $regex: query.color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }

  if (query.wishlist === 'true' && userId) {
    const wishlist = await Wishlist.findOne({ user: userId }).lean();
    const ids = wishlist?.products || [];
    filter._id = { $in: ids.length ? ids : [null] };
  }

  const sort = buildSort(query.sort);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: toPublicProductList(products),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, isActive: true }).populate(
    'category',
    'name slug'
  );
  if (!product) throw notFound('Product');

  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .populate('category', 'slug');

  return {
    product: toPublicProduct(product, {
      relatedProducts: toPublicProductList(related),
    }),
    relatedProducts: toPublicProductList(related),
  };
};

export const getFeaturedProducts = async (limit = 3) => {
  const products = await Product.find({ featured: true, isActive: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('category', 'slug');
  return toPublicProductList(products);
};

export const getTrendingProducts = async (limit = 8) => {
  const products = await Product.find({ trending: true, isActive: true })
    .sort({ trendingScore: -1 })
    .limit(limit)
    .populate('category', 'slug');
  return toPublicProductList(products);
};

export const getTopRatedProducts = async (limit = 3) => {
  const products = await Product.find({ isActive: true, ratingsCount: { $gte: 1 } })
    .sort({ ratingsAverage: -1, ratingsCount: -1 })
    .limit(limit)
    .populate('category', 'slug');
  return toPublicProductList(products);
};

export const getSpecialOffers = async (limit = 3) => {
  const products = await Product.find({
    isActive: true,
    compareAtPrice: { $exists: true, $gt: 0 },
    $expr: { $gt: ['$compareAtPrice', '$price'] },
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('category', 'slug');
  return toPublicProductList(products);
};

export const resolveProduct = async (productIdOrSlug) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(productIdOrSlug);
  const filter = isObjectId
    ? { _id: productIdOrSlug }
    : { slug: productIdOrSlug };

  const product = await Product.findOne({
    ...filter,
    isActive: true,
  });
  if (!product) throw notFound('Product');
  return product;
};

export const createProduct = async (data, adminId) => {
  const category = await Category.findById(data.category);
  if (!category) throw badRequest('Invalid category');

  const product = await Product.create({
    ...data,
    createdBy: adminId,
  });
  return toPublicProduct(await product.populate('category', 'slug'));
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('category', 'slug');
  if (!product) throw notFound('Product');
  return toPublicProduct(product);
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!product) throw notFound('Product');
  return product;
};

export const updateInventory = async (id, variants) => {
  const product = await Product.findById(id);
  if (!product) throw notFound('Product');

  for (const update of variants) {
    const variant = product.variants.id(update.variantId);
    if (variant) variant.stock = update.stock;
  }

  await product.save();
  return toPublicProduct(product);
};
