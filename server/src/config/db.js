import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  const maxRetries = 5;
  const retryInterval = 3000; // 3 seconds
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mongoose.connect(config.mongodbUri, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      lastError = err;
      logger.warn(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${err.message}. Retrying in ${retryInterval / 1000}s...`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message}`);
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', { error: err.message });
});

export const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
};
