import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

const router = Router();

router.use(protect, requireAdmin);

router.get('/dashboard', adminController.dashboard);
router.get('/users', adminController.listUsers);
router.patch(
  '/users/:id',
  validate(
    z.object({
      params: z.object({ id: objectId }),
      body: z.object({
        name: z.string().optional(),
        role: z.enum(['user', 'admin']).optional(),
        isActive: z.boolean().optional(),
      }),
    })
  ),
  adminController.updateUser
);

router.patch(
  '/reviews/:reviewId',
  validate(
    z.object({
      params: z.object({ reviewId: objectId }),
      body: z.object({ isApproved: z.boolean() }),
    })
  ),
  reviewController.moderateReview
);

export default router;
