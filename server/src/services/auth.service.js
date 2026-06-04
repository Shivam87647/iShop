import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import config from '../config/index.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateResetToken,
} from '../utils/token.js';
import { badRequest, unauthorized, notFound, conflict } from '../utils/AppError.js';
import { COOKIE_NAMES } from '../constants/index.js';
import { sendPasswordResetEmail } from './email.service.js';

const buildTokens = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({
      ...payload,
      jti: crypto.randomBytes(16).toString('hex'),
    }),
  };
};

const persistRefreshToken = async (userId, refreshToken, meta = {}) => {
  const decoded = verifyRefreshToken(refreshToken);
  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/api/v1/auth' });
};

export const register = async (data, meta) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw conflict('Email already registered');

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  const tokens = buildTokens(user);
  await persistRefreshToken(user._id, tokens.refreshToken, meta);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, ...tokens };
};

export const login = async (data, meta) => {
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user || !(await user.comparePassword(data.password))) {
    throw unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw unauthorized('Account is deactivated');

  const tokens = buildTokens(user);
  await persistRefreshToken(user._id, tokens.refreshToken, meta);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, ...tokens };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(refreshToken), revokedAt: null },
    { revokedAt: new Date() }
  );
};

export const refreshSession = async (refreshToken, meta) => {
  if (!refreshToken) throw unauthorized('Refresh token required');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw unauthorized('Invalid refresh token');
  }

  const stored = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
    revokedAt: null,
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw unauthorized('Refresh token expired or revoked');
  }

  const user = await User.findById(decoded.sub);
  if (!user?.isActive) throw unauthorized('User not found');

  await RefreshToken.updateOne({ _id: stored._id }, { revokedAt: new Date() });

  const tokens = buildTokens(user);
  await persistRefreshToken(user._id, tokens.refreshToken, meta);

  return { user, ...tokens };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { message: 'If that email exists, a reset link was sent.' };
  }

  const { resetToken, hashedToken, expiresAt } = generateResetToken();
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user, resetUrl);

  return { message: 'If that email exists, a reset link was sent.' };
};

export const resetPassword = async (token, newPassword) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) throw badRequest('Token is invalid or has expired');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await RefreshToken.updateMany({ user: user._id }, { revokedAt: new Date() });

  const tokens = buildTokens(user);
  return { user, ...tokens };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw notFound('User');
  return user;
};

export const updateProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw notFound('User');
  return user;
};

export const addAddress = async (userId, address) => {
  const user = await User.findById(userId);
  if (!user) throw notFound('User');

  if (address.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  if (user.addresses.length === 0) address.isDefault = true;
  user.addresses.push(address);
  await user.save();
  return user.addresses;
};

export const updateAddress = async (userId, addressId, updates) => {
  const user = await User.findById(userId);
  if (!user) throw notFound('User');

  const addr = user.addresses.id(addressId);
  if (!addr) throw notFound('Address');

  if (updates.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  Object.assign(addr, updates);
  await user.save();
  return user.addresses;
};

export const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw notFound('User');

  const addr = user.addresses.id(addressId);
  if (!addr) throw notFound('Address');

  const wasDefault = addr.isDefault;
  addr.deleteOne();
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }
  await user.save();
  return user.addresses;
};
