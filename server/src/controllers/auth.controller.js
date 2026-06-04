import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import { COOKIE_NAMES } from '../constants/index.js';

const getMeta = (req) => ({
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
});

const getRefreshFromRequest = (req) =>
  req.body?.refreshToken || req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, getMeta(req));
  authService.setRefreshCookie(res, result.refreshToken);
  sendCreated(res, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, getMeta(req));
  authService.setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, {
    message: 'Logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(getRefreshFromRequest(req));
  authService.clearRefreshCookie(res);
  sendSuccess(res, { message: 'Logged out successfully' });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshSession(
    getRefreshFromRequest(req),
    getMeta(req)
  );
  authService.setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, {
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, { message: result.message });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.params.token, req.body.password);
  authService.setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, {
    message: 'Password reset successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  sendSuccess(res, { data: { user } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  sendSuccess(res, { message: 'Profile updated', data: { user } });
});

export const addAddress = asyncHandler(async (req, res) => {
  const addresses = await authService.addAddress(req.user._id, req.body);
  sendSuccess(res, { data: { addresses } });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const addresses = await authService.updateAddress(
    req.user._id,
    req.params.addressId,
    req.body
  );
  sendSuccess(res, { data: { addresses } });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const addresses = await authService.deleteAddress(
    req.user._id,
    req.params.addressId
  );
  sendSuccess(res, { data: { addresses } });
});
