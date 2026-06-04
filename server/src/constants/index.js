export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PRODUCT_BADGES = ['HOT', 'NEW', 'SALE'];

export const CATEGORY_SLUGS = ['mac', 'iphone', 'ipad', 'watch', 'accessories'];

export const SORT_OPTIONS = {
  DEFAULT: 'default',
  PRICE_ASC: 'price-low',
  PRICE_DESC: 'price-high',
  RATING: 'rating',
  NEWEST: 'newest',
  TRENDING: 'trending',
};

export const COOKIE_NAMES = {
  REFRESH_TOKEN: 'ishop_refresh_token',
};
