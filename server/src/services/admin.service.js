import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { ORDER_STATUS } from '../constants/index.js';
import { notFound } from '../utils/AppError.js';

export const getDashboardAnalytics = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalProducts,
    activeProducts,
    totalOrders,
    revenueAgg,
    ordersByStatus,
    recentOrders,
    lowStockProducts,
    newUsers,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      {
        $match: {
          status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED] },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .select('orderNumber total status createdAt user'),
    Product.find({ isActive: true, totalStock: { $lte: 5 } })
      .select('name slug totalStock')
      .limit(10)
      .lean(),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  const revenue30d = revenueAgg[0]?.revenue || 0;
  const orders30d = revenueAgg[0]?.count || 0;

  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.slug',
        name: { $first: '$items.name' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.lineTotal' },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 5 },
  ]);

  const pendingReviews = await Review.countDocuments({ isApproved: false });

  return {
    overview: {
      totalUsers,
      newUsersLast30Days: newUsers,
      totalProducts,
      activeProducts,
      totalOrders,
      ordersLast30Days: orders30d,
      revenueLast30Days: revenue30d,
      pendingReviews,
    },
    ordersByStatus: ordersByStatus.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {}),
    recentOrders,
    lowStockProducts,
    topProducts,
  };
};

export const listUsers = async ({ page = 1, limit = 20, search }) => {
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

export const updateUser = async (userId, updates) => {
  const allowed = ['name', 'role', 'isActive'];
  const data = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) data[key] = updates[key];
  }

  const user = await User.findByIdAndUpdate(userId, data, { new: true });
  if (!user) throw notFound('User');
  return user;
};
