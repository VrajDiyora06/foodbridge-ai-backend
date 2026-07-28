import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../database';
import { FoodRepository } from '../repositories/food.repository';
import { FoodStatus } from '../models/food.model';
import { FOOD_EXPIRY_QUEUE } from './queueNames';
import logger from '../utils/logger';

export interface FoodExpiryJobData {
  foodId: string;
}

const foodRepository = new FoodRepository();
export let foodExpiryWorker: Worker<FoodExpiryJobData> | null = null;

/**
 * Job processor function for food expiry checks.
 */
export const processFoodExpiryJob = async (
  job: Job<FoodExpiryJobData>,
): Promise<void> => {
  const { foodId } = job.data;

  if (!foodId) {
    logger.warn(`[FoodExpiryWorker] Job ${job.id} missing foodId payload`);
    return;
  }

  try {
    const food = await foodRepository.findById(foodId);

    // If food listing does not exist, log warning and finish job cleanly
    if (!food) {
      logger.warn(`[FoodExpiryWorker] Food listing not found for expiry check: ${foodId}`);
      return;
    }

    // Do nothing if listing is already in a terminal/inactive state
    const terminalStatuses: FoodStatus[] = [
      FoodStatus.EXPIRED,
      FoodStatus.DELIVERED,
      FoodStatus.CANCELLED,
    ];

    if (terminalStatuses.includes(food.status)) {
      logger.info(
        `[FoodExpiryWorker] Food listing ${foodId} is already in status '${food.status}'. Skipping.`,
      );
      return;
    }

    const now = new Date();
    const expiresAt = new Date(food.expiresAt);

    // Mark as EXPIRED if expiresAt time has passed
    if (expiresAt <= now) {
      await foodRepository.updateStatus(foodId, FoodStatus.EXPIRED);
      logger.info(`[FoodExpiryWorker] Food listing ${foodId} marked as EXPIRED`);
    } else {
      logger.info(
        `[FoodExpiryWorker] Food listing ${foodId} is not yet expired (expiresAt: ${expiresAt.toISOString()}).`,
      );
    }
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[FoodExpiryWorker] Error processing expiry for foodId ${foodId}: ${err.message}`,
      { error: err.message, stack: err.stack },
    );
    // Rethrow to let BullMQ handle retries based on the backoff strategy
    throw error;
  }
};

/**
 * Initialize the Food Expiry BullMQ Worker.
 * Must be called after Redis connection is established.
 */
export const initFoodExpiryWorker = (): Worker<FoodExpiryJobData> => {
  if (foodExpiryWorker) return foodExpiryWorker;

  const connection = getRedisClient();

  foodExpiryWorker = new Worker<FoodExpiryJobData>(
    FOOD_EXPIRY_QUEUE,
    processFoodExpiryJob,
    {
      connection,
      concurrency: 5,
    },
  );

  foodExpiryWorker.on('completed', (job) => {
    logger.info(`[FoodExpiryWorker] Job ${job.id} completed successfully`);
  });

  foodExpiryWorker.on('failed', (job, err) => {
    logger.error(
      `[FoodExpiryWorker] Job ${job?.id} failed with error: ${err.message}`,
      { error: err.message, stack: err.stack },
    );
  });

  foodExpiryWorker.on('error', (err) => {
    logger.error(`[FoodExpiryWorker] Worker error: ${err.message}`, {
      error: err.message,
      stack: err.stack,
    });
  });

  logger.info('FoodExpiryWorker initialized successfully');
  return foodExpiryWorker;
};

/**
 * Gracefully shut down the Food Expiry Worker.
 */
export const closeFoodExpiryWorker = async (): Promise<void> => {
  if (foodExpiryWorker) {
    await foodExpiryWorker.close();
    foodExpiryWorker = null;
    logger.info('FoodExpiryWorker closed gracefully');
  }
};
