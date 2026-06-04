import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return { resetToken, hashedToken, expiresAt };
};
