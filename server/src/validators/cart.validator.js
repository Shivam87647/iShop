import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.union([objectId, z.string().min(1)]),
    productSlug: z.string().optional(),
    variantId: objectId.optional(),
    quantity: z.number().int().min(1).default(1),
    selectedColor: z.string().optional(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: objectId,
  }),
  body: z.object({
    quantity: z.number().int().min(0),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(30),
  }),
});

export const wishlistProductSchema = z.object({
  body: z.object({
    productId: z.union([objectId, z.string().min(1)]).optional(),
    productSlug: z.string().optional(),
  }),
});
