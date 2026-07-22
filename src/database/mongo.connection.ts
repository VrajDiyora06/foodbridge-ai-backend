import mongoose from 'mongoose';
import { env } from '../config';
import logger from '../utils/logger';

/**
 * Connect to MongoDB with retry logic. Mongoose buffers commands
 * until connected, but we log explicitly so operators know what's
 * happening during startup.
 */
export const connectMongo = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      autoIndex: !env.isProduction, // disable auto-index in prod for performance
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}:${conn.connection.port}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error('MongoDB initial connection failed', {
      error: error instanceof Error ? error.message : error,
    });
    process.exit(1);
  }
};

/**
 * Graceful disconnect — called during SIGTERM/SIGINT shutdown.
 */
export const disconnectMongo = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
};
