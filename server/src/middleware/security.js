import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import config from '../config/index.js';

export const applySecurityMiddleware = (app) => {
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: config.isProduction ? 300 : 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please try again later.' },
    })
  );

  app.use(
    '/api/v1/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: config.isProduction ? 30 : 1000,
      message: { success: false, message: 'Too many auth attempts. Try again later.' },
    })
  );

  app.use(mongoSanitize());
  app.use(xss());
  app.use(
    hpp({
      whitelist: [
        'sort',
        'category',
        'search',
        'page',
        'limit',
        'minPrice',
        'maxPrice',
        'color',
        'featured',
        'trending',
      ],
    })
  );
};
