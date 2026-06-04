import { z } from 'zod';
import { ORDER_STATUS } from '../constants/index.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      fullName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().optional(),
      postalCode: z.string().min(3),
      country: z.string().default('US').optional(),
    }),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['mock', 'stripe']).default('mock'),
    idempotencyKey: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const cancelOrderSchema = z.object({
  params: orderIdSchema.shape.params,
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: orderIdSchema.shape.params,
  body: z.object({
    status: z.enum(Object.values(ORDER_STATUS)),
    note: z.string().max(500).optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: objectId,
    providerPaymentId: z.string().optional(),
    idempotencyKey: z.string().optional(),
  }),
});

export const reviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120).optional(),
    body: z.string().max(2000).optional(),
  }),
  params: z.object({
    slug: z.string().min(1),
  }),
});
