import * as adminService from '../services/admin.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const data = await adminService.getDashboardAnalytics();
  sendSuccess(res, { data });
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  sendSuccess(res, { data: result.users, meta: result.meta });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body);
  sendSuccess(res, { data: user });
});
