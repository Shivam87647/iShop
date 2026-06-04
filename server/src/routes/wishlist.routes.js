import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { wishlistProductSchema } from '../validators/cart.validator.js';
import { z } from 'zod';

const router = Router();

router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/', validate(wishlistProductSchema), wishlistController.add);
router.post('/toggle', validate(wishlistProductSchema), wishlistController.toggle);
router.delete(
  '/:productSlug',
  validate(z.object({ params: z.object({ productSlug: z.string().min(1) }) })),
  wishlistController.remove
);

export default router;
