import { z } from 'zod';
import { PRODUCT_BADGES } from '../constants/index.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

const variantSchema = z.object({
  sku: z.string().min(1),
  color: z.object({ name: z.string(), hex: z.string() }).optional(),
  size: z.string().optional(),
  stock: z.number().int().min(0),
  price: z.number().min(0).optional(),
});

export const productListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    color: z.string().optional(),
    badge: z.enum(PRODUCT_BADGES).optional(),
    featured: z.enum(['true', 'false']).optional(),
    trending: z.enum(['true', 'false']).optional(),
    sort: z
      .enum(['default', 'price-low', 'price-high', 'rating', 'newest', 'trending'])
      .optional(),
    wishlist: z.string().optional(),
  }),
});

export const productSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    slug: z.string().optional(),
    description: z.string().min(10),
    category: objectId,
    subcategory: objectId.optional(),
    price: z.number().min(0),
    compareAtPrice: z.number().min(0).optional(),
    badge: z.enum(PRODUCT_BADGES).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          publicId: z.string().optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      .optional(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    variants: z.array(variantSchema).optional(),
    featured: z.boolean().optional(),
    trending: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = createProductSchema.extend({
  body: createProductSchema.shape.body.partial(),
});

export const productIdSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});
