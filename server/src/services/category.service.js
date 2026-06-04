import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { notFound, badRequest } from '../utils/AppError.js';

export const listCategories = async (includeCounts = true) => {
  const categories = await Category.find({ isActive: true, parent: null })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  if (!includeCounts) return categories;

  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  const withSubs = await Promise.all(
    categories.map(async (cat) => {
      const subcategories = await Category.find({ parent: cat._id, isActive: true })
        .sort({ sortOrder: 1 })
        .lean();
      return {
        ...cat,
        productCount: countMap[cat._id.toString()] || 0,
        subcategories,
      };
    })
  );

  const total = await Product.countDocuments({ isActive: true });

  return { categories: withSubs, totalProducts: total };
};

export const createCategory = async (data) => {
  if (data.parent) {
    const parent = await Category.findById(data.parent);
    if (!parent) throw badRequest('Parent category not found');
  }
  return Category.create(data);
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!category) throw notFound('Category');
  return category;
};

export const deleteCategory = async (id) => {
  const productCount = await Product.countDocuments({ category: id, isActive: true });
  if (productCount > 0) {
    throw badRequest('Cannot delete category with active products');
  }
  const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!category) throw notFound('Category');
  return category;
};
