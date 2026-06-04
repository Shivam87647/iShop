import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import routes from './routes/index.js';
import { applySecurityMiddleware } from './middleware/security.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

applySecurityMiddleware(app);

const allowedOrigins = [
  config.clientUrl,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || 
                        /^https?:\/\/localhost:\d+$/.test(origin) || 
                        /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(`/api/${config.apiVersion}`, routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
