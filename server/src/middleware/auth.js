import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token.js';
import { unauthorized, forbidden } from '../utils/AppError.js';
import { ROLES } from '../constants/index.js';

export const protect = asyncHandler(async (req, _res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(unauthorized('Authentication required'));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(unauthorized('Invalid or expired access token'));
  }

  const user = await User.findById(decoded.sub).select('+password');
  if (!user || !user.isActive) {
    return next(unauthorized('User no longer exists or is deactivated'));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(unauthorized('Password recently changed. Please log in again.'));
  }

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (user?.isActive) req.user = user;
  } catch {
    // ignore invalid token for optional routes
  }
  next();
});

export const restrictTo = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(forbidden('You do not have permission for this action'));
    }
    next();
  });

export const requireAdmin = restrictTo(ROLES.ADMIN);
