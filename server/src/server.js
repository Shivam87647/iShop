import app from './app.js';
import config from './config/index.js';
import { connectDB, disconnectDB } from './config/db.js';
import logger from './utils/logger.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(`iShop API listening on port ${config.port} [${config.env}]`);
    logger.info(`API base: http://localhost:${config.port}/api/${config.apiVersion}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection', { error: err?.message });
    shutdown('unhandledRejection');
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
