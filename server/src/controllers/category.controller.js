import * as categoryService from '../services/category.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const list = asyncHandler(async (_req, res) => {
  const data = await categoryService.listCategories();
  sendSuccess(res, { data });
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  sendCreated(res, category);
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, { data: category });
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  sendSuccess(res, { message: 'Category deactivated' });
});
