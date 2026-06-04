import mongoose from 'mongoose';
import config from '../config/index.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';
import { ROLES } from '../constants/index.js';

const categories = [
  { name: 'MacBook', slug: 'mac', sortOrder: 1 },
  { name: 'iPhone', slug: 'iphone', sortOrder: 2 },
  { name: 'iPad', slug: 'ipad', sortOrder: 3 },
  { name: 'Apple Watch', slug: 'watch', sortOrder: 4 },
  { name: 'Accessories', slug: 'accessories', sortOrder: 5 },
];

const productsSeed = [
  {
    slug: 'iphone-11-pro',
    name: 'iPhone 11 Pro Max Space Gray',
    category: 'iphone',
    price: 899,
    compareAtPrice: 999,
    badge: 'HOT',
    featured: true,
    trending: true,
    trendingScore: 100,
    description:
      'iPhone 11 Pro Max features a transformative triple-camera system that adds tons of capability without complexity. An unprecedented leap in battery life.',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Space Gray', hex: '#4A4B4D' },
      { name: 'Midnight Green', hex: '#4E5851' },
      { name: 'Gold', hex: '#F5E0C8' },
      { name: 'Silver', hex: '#E3E4E5' },
    ],
    specs: [
      { label: 'Display', value: '6.5-inch Super Retina XDR OLED display' },
      { label: 'Chip', value: 'A13 Bionic chip with third-generation Neural Engine' },
      { label: 'Camera', value: 'Triple 12MP Ultra Wide, Wide, and Telephoto cameras' },
    ],
  },
  {
    slug: 'macbook-pro-13',
    name: 'MacBook Pro 13-inch Core i5',
    category: 'mac',
    price: 1199,
    compareAtPrice: 1299,
    badge: 'NEW',
    featured: true,
    trending: true,
    description:
      'MacBook Pro elevates the laptop to a whole new level of performance and portability.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Space Gray', hex: '#5E6266' },
      { name: 'Silver', hex: '#E3E4E5' },
    ],
    specs: [
      { label: 'Processor', value: '1.4GHz quad-core Intel Core i5' },
      { label: 'Memory', value: '8GB of 2133MHz LPDDR3 onboard memory' },
      { label: 'Storage', value: '256GB or 512GB SSD storage' },
    ],
  },
  {
    slug: 'ipad-pro-11',
    name: 'iPad Pro 11-inch Wi-Fi 128GB',
    category: 'ipad',
    price: 799,
    badge: 'NEW',
    featured: true,
    description: "It's all screen and all powerhouse.",
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Space Gray', hex: '#5E6266' },
      { name: 'Silver', hex: '#E3E4E5' },
    ],
    specs: [
      { label: 'Display', value: '11-inch Liquid Retina display with ProMotion and True Tone' },
      { label: 'Chip', value: 'A12X Bionic chip with Neural Engine' },
    ],
  },
  {
    slug: 'apple-watch-s5',
    name: 'Apple Watch Series 5 Space Black',
    category: 'watch',
    price: 399,
    compareAtPrice: 429,
    badge: 'HOT',
    trending: true,
    trendingScore: 80,
    description: 'This watch has a display that never sleeps.',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Space Black', hex: '#222325' },
      { name: 'Silver', hex: '#E3E4E5' },
      { name: 'Gold', hex: '#E8D3C0' },
    ],
    specs: [{ label: 'Case Size', value: '40mm or 44mm' }],
  },
  {
    slug: 'airpods-pro',
    name: 'Apple AirPods Pro Wireless Case',
    category: 'accessories',
    price: 249,
    compareAtPrice: 279,
    badge: 'SALE',
    trending: true,
    description: 'Active Noise Cancellation for immersive sound.',
    image: 'https://images.unsplash.com/photo-1588449668338-d134ae213c4f?q=80&w=600&auto=format&fit=crop',
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    specs: [{ label: 'Audio', value: 'Active Noise Cancellation' }],
  },
  {
    slug: 'iphone-11',
    name: 'iPhone 11 128GB Product Red',
    category: 'iphone',
    price: 699,
    description: 'Just the right amount of everything.',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Black', hex: '#1C1D21' },
      { name: 'Green', hex: '#D4E8DC' },
      { name: 'Red', hex: '#D93646' },
    ],
    specs: [{ label: 'Display', value: '6.1-inch Liquid Retina HD LCD display' }],
  },
  {
    slug: 'macbook-air-13',
    name: 'MacBook Air 13-inch Core i3',
    category: 'mac',
    price: 999,
    compareAtPrice: 1099,
    description: 'The incredibly thin and light MacBook Air.',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Space Gray', hex: '#5E6266' },
      { name: 'Gold', hex: '#E6CBB3' },
      { name: 'Silver', hex: '#E3E4E5' },
    ],
    specs: [{ label: 'Processor', value: '1.1GHz dual-core Intel Core i3' }],
  },
  {
    slug: 'ipad-air-10-5',
    name: 'iPad Air 10.5-inch Wi-Fi 64GB',
    category: 'ipad',
    price: 499,
    description: 'iPad Air brings more of our most powerful technologies.',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Space Gray', hex: '#5E6266' },
      { name: 'Silver', hex: '#E3E4E5' },
    ],
    specs: [{ label: 'Display', value: '10.5-inch Retina display' }],
  },
  {
    slug: 'apple-watch-s3',
    name: 'Apple Watch Series 3 GPS 38mm',
    category: 'watch',
    price: 199,
    compareAtPrice: 229,
    badge: 'SALE',
    description: 'Track your workouts. Monitor your health.',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Space Gray', hex: '#5E6266' },
      { name: 'Silver', hex: '#E3E4E5' },
    ],
    specs: [{ label: 'Battery', value: 'Up to 18 hours' }],
  },
  {
    slug: 'beats-solo3',
    name: 'Beats Solo3 Wireless Headphones',
    category: 'accessories',
    price: 179,
    compareAtPrice: 199,
    description: 'Up to 40 hours of battery life.',
    image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Black', hex: '#1C1D21' },
      { name: 'Rose Gold', hex: '#E1BAB3' },
    ],
    specs: [{ label: 'Battery Life', value: 'Up to 40 hours' }],
  },
  {
    slug: 'leather-case-iphone-11',
    name: 'iPhone 11 Pro Leather Case Black',
    category: 'accessories',
    price: 49,
    badge: 'NEW',
    description: 'Premium European leather case.',
    image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=600&auto=format&fit=crop',
    colors: [
      { name: 'Black', hex: '#1C1D21' },
      { name: 'Saddle Brown', hex: '#8A5636' },
    ],
    specs: [{ label: 'Material', value: 'Premium European leather' }],
  },
  {
    slug: 'lightning-usb-cable',
    name: 'Lightning to USB Cable (1m)',
    category: 'accessories',
    price: 19,
    compareAtPrice: 25,
    description: 'USB 2.0 cable for syncing and charging.',
    image: 'https://images.unsplash.com/photo-1588449668338-d134ae213c4f?q=80&w=600&auto=format&fit=crop',
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    specs: [{ label: 'Length', value: '1 meter' }],
  },
];

const buildVariants = (slug, colors, price) =>
  colors.map((color, index) => ({
    sku: `${slug}-${slugifyColor(color.name)}`,
    color,
    stock: 25 + index * 5,
    price,
  }));

const slugifyColor = (name) =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const seed = async () => {
  await connectDB();

  logger.info('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'iShop Admin',
    email: config.seed.adminEmail,
    password: config.seed.adminPassword,
    role: ROLES.ADMIN,
  });

  const demoUser = await User.create({
    name: 'Demo Shopper',
    email: 'demo@ishop.local',
    password: 'Demo@123456',
    role: ROLES.USER,
  });

  logger.info(`Admin: ${admin.email} / ${config.seed.adminPassword}`);
  logger.info('Demo user: demo@ishop.local / Demo@123456');

  const categoryDocs = {};
  for (const cat of categories) {
    categoryDocs[cat.slug] = await Category.create(cat);
  }

  for (const item of productsSeed) {
    const category = categoryDocs[item.category];
    const variants = buildVariants(item.slug, item.colors, item.price);

    await Product.create({
      name: item.name,
      slug: item.slug,
      description: item.description,
      category: category._id,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      badge: item.badge,
      featured: item.featured || false,
      trending: item.trending || false,
      trendingScore: item.trendingScore || 0,
      images: [{ url: item.image, isPrimary: true }],
      specs: item.specs,
      variants,
      ratingsAverage: item.slug === 'iphone-11-pro' ? 5 : 4,
      ratingsCount: 18,
      createdBy: admin._id,
    });
  }

  await Coupon.insertMany([
    {
      code: 'ISHOP10',
      description: '10% off your order',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0,
      isActive: true,
    },
    {
      code: 'APPLE20',
      description: '20% off your order',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 100,
      isActive: true,
    },
  ]);

  const sampleProduct = await Product.findOne({ slug: 'iphone-11-pro' });
  await Review.create({
    product: sampleProduct._id,
    user: demoUser._id,
    rating: 5,
    title: 'Excellent phone',
    body: 'Battery life and camera are outstanding.',
    isVerifiedPurchase: true,
  });

  logger.info(`Seeded ${productsSeed.length} products and ${categories.length} categories`);
  await disconnectDB();
  process.exit(0);
};

seed().catch(async (err) => {
  logger.error('Seed failed', { error: err.message });
  await disconnectDB();
  process.exit(1);
});
