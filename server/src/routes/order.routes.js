import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderSchema,
  orderIdSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  verifyPaymentSchema,
} from '../validators/order.validator.js';

const router = Router();

router.use(protect);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.post('/payments/verify', validate(verifyPaymentSchema), orderController.verifyPayment);
router.get('/', orderController.getMyOrders);

router.get('/admin/all', requireAdmin, orderController.adminListOrders);
router.patch(
  '/:id/status',
  requireAdmin,
  validate(updateOrderStatusSchema),
  orderController.adminUpdateStatus
);

router.get('/:id', validate(orderIdSchema), orderController.getOrder);
router.patch('/:id/cancel', validate(cancelOrderSchema), orderController.cancelOrder);

export default router;
