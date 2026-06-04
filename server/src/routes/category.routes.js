import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().optional(),
    description: z.string().optional(),
    parent: objectId.optional(),
    sortOrder: z.number().optional(),
    image: z.object({ url: z.string().url(), publicId: z.string().optional() }).optional(),
  }),
});

const router = Router();

router.get('/', categoryController.list);

router.use(protect, requireAdmin);
router.post('/', validate(createCategorySchema), categoryController.create);
router.patch(
  '/:id',
  validate(
    z.object({
      params: z.object({ id: objectId }),
      body: createCategorySchema.shape.body.partial(),
    })
  ),
  categoryController.update
);
router.delete('/:id', validate(z.object({ params: z.object({ id: objectId }) })), categoryController.remove);

export default router;
