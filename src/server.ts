import app from './app';
import { env } from './config';
import { connectMongo, disconnectMongo, connectRedis, disconnectRedis } from './database';
import { initQueues, closeQueues } from './jobs';
import logger from './utils/logger';

const startServer = async () => {
  // ── Connect external services ──────────────────────────
  await connectMongo();
  await connectRedis();
  initQueues();

  // ── Start HTTP server ──────────────────────────────────
  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`API docs: http://localhost:${env.port}${env.apiPrefix}/docs`);
  });

  // ── Graceful shutdown ──────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
      logger.info('HTTP server closed');

      await closeQueues();
      await disconnectMongo();
      await disconnectRedis();

      logger.info('All connections closed — exiting');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ── Catch unhandled errors at the process level ────────
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    // Let the process crash so the container runtime restarts it
    throw reason;
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });
};

startServer();
