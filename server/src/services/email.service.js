import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.pass }
      : undefined,
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();
  if (!transport) {
    logger.warn('SMTP not configured; email not sent', { to, subject });
    return { simulated: true };
  }

  const info = await transport.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
    text,
  });

  return info;
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  return sendEmail({
    to: user.email,
    subject: 'iShop — Reset your password',
    html: `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the link below (valid for 1 hour):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, ignore this email.</p>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
};

export const sendOrderConfirmationEmail = async (user, order) => {
  return sendEmail({
    to: user.email,
    subject: `iShop — Order ${order.orderNumber} confirmed`,
    html: `
      <p>Hi ${user.name},</p>
      <p>Thank you for your order <strong>${order.orderNumber}</strong>.</p>
      <p>Total: <strong>$${order.total.toFixed(2)}</strong></p>
      <p>Status: ${order.status}</p>
    `,
    text: `Order ${order.orderNumber} confirmed. Total: $${order.total}`,
  });
};
