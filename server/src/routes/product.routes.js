import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import { validate } from '../middleware/validate.js';
import { protect, requireAdmin, optionalAuth } from '../middleware/auth.js';
import {
  productListSchema,
  productSlugSchema,
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from '../validators/product.validator.js';
import { reviewSchema } from '../validators/order.validator.js';
import { z } from 'zod';

const router = Router();

router.get('/home', productController.getHomeCollections);
router.get('/featured', productController.getFeatured);
router.get('/trending', productController.getTrending);
router.get('/', validate(productListSchema), optionalAuth, productController.listProducts);

router.get('/:slug', validate(productSlugSchema), productController.getProduct);
router.get('/:slug/reviews', validate(productSlugSchema), reviewController.listReviews);
router.post(
  '/:slug/reviews',
  protect,
  validate(reviewSchema),
  reviewController.createReview
);

router.post(
  '/',
  protect,
  requireAdmin,
  validate(createProductSchema),
  productController.createProduct
);
router.patch(
  '/manage/:id',
  protect,
  requireAdmin,
  validate(productIdSchema.merge(updateProductSchema)),
  productController.updateProduct
);
router.delete(
  '/manage/:id',
  protect,
  requireAdmin,
  validate(productIdSchema),
  productController.deleteProduct
);
router.patch(
  '/manage/:id/inventory',
  protect,
  requireAdmin,
  validate(
    z.object({
      params: productIdSchema.shape.params,
      body: z.object({
        variants: z.array(
          z.object({
            variantId: z.string().regex(/^[a-f\d]{24}$/i),
            stock: z.number().int().min(0),
          })
        ),
      }),
    })
  ),
  productController.updateInventory
);

export default router;
