import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
  body: z.object({
    password: passwordSchema,
  }),
});

export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    avatar: z
      .object({
        url: z.string().url(),
        publicId: z.string().optional(),
      })
      .optional(),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    label: z.string().max(50).optional(),
    fullName: z.string().min(2).max(100),
    phone: z.string().max(20).optional(),
    street: z.string().min(3).max(200),
    city: z.string().min(2).max(100),
    state: z.string().max(100).optional(),
    postalCode: z.string().min(3).max(20),
    country: z.string().max(2).default('US').optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const addressIdSchema = z.object({
  params: z.object({
    addressId: z.string().regex(/^[a-f\d]{24}$/i),
  }),
});
