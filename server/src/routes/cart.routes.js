import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  applyCouponSchema,
} from '../validators/cart.validator.js';

const router = Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addItem);
router.patch('/items/:itemId', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:itemId', validate(updateCartItemSchema.pick({ params: true })), cartController.removeItem);
router.delete('/', cartController.clear);
router.post('/coupon', validate(applyCouponSchema), cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

export default router;
