import config from '../config/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

const handleCastError = () => new AppError('Invalid resource identifier', 400);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return new AppError(`Duplicate value for ${field}`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors || {}).map((e) => e.message);
  return new AppError(messages.join('. ') || 'Validation failed', 400);
};

const handleJWTError = () => new AppError('Invalid token', 401);
const handleJWTExpired = () => new AppError('Token expired', 401);

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

export const globalErrorHandler = (err, req, res, _next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    if (error.name === 'CastError') error = handleCastError();
    else if (error.code === 11000) error = handleDuplicateKey(error);
    else if (error.name === 'ValidationError') error = handleValidationError(error);
    else if (error.name === 'JsonWebTokenError') error = handleJWTError();
    else if (error.name === 'TokenExpiredError') error = handleJWTExpired();
    else {
      error = new AppError(
        config.isProduction ? 'Internal server error' : err.message,
        err.statusCode || 500
      );
    }
  }

  if (!error.isOperational) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
    });
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message,
    status: error.status,
  };

  if (error.errors) response.errors = error.errors;

  if (config.isDevelopment) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
