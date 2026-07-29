import Redis from 'ioredis';
import { env } from '../config';
import logger from '../utils/logger';

let redisClient: Redis | null = null;

/**
 * Create and return a singleton Redis client. BullMQ and
 * application code share this connection (BullMQ can also
 * create its own if needed).
 */
export const connectRedis = async (): Promise<Redis> => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: env.redisHost,
    port: env.redisPort,
    password: env.redisPassword || undefined,
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      logger.warn(`Redis reconnecting — attempt ${times}, next in ${delay}ms`);
      return delay;
    },
  });

  redisClient.on('connect', () => {
    logger.info(`Redis connected: ${env.redisHost}:${env.redisPort}`);
  });

  redisClient.on('error', (err) => {
    logger.error('Redis connection error', { error: err.message });
  });

  // Wait for the client to be ready before returning
  await new Promise<void>((resolve, reject) => {
    redisClient!.once('ready', resolve);
    redisClient!.once('error', reject);
  });

  return redisClient;
};

/**
 * Get the existing Redis client (throws if not connected yet).
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized — call connectRedis() first');
  }
  return redisClient;
};

/**
 * Graceful disconnect.
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected gracefully');
  }
};
