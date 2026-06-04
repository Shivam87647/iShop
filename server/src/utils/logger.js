import winston from 'winston';
import config from '../config/index.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}]: ${stack || message}${metaStr}`;
});

const logger = winston.createLogger({
  level: config.isProduction ? 'info' : 'debug',
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      format: config.isDevelopment ? combine(colorize(), logFormat) : logFormat,
    }),
  ],
});

export default logger;
