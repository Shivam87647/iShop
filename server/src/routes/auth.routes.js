import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  updateProfileSchema,
  addressSchema,
  addressIdSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', validate(refreshTokenSchema), authController.logout);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.patch('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);

router.use(protect);
router.get('/me', authController.getMe);
router.patch('/me', validate(updateProfileSchema), authController.updateMe);
router.post('/addresses', validate(addressSchema), authController.addAddress);
router.patch('/addresses/:addressId', validate(addressIdSchema.merge(addressSchema)), authController.updateAddress);
router.delete('/addresses/:addressId', validate(addressIdSchema), authController.deleteAddress);

export default router;
