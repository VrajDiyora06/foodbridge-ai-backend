import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../database';
import { reservationRepository } from '../repositories/reservation.repository';
import { FoodRepository } from '../repositories/food.repository';
import { ReservationStatus } from '../models/reservation.model';
import { FoodStatus } from '../models/food.model';
import { RESERVATION_EXPIRY_QUEUE } from './queueNames';
import logger from '../utils/logger';

export interface ReservationExpiryJobData {
  reservationId: string;
}

const foodRepository = new FoodRepository();
export let reservationExpiryWorker: Worker<ReservationExpiryJobData> | null = null;

/**
 * Job processor function for reservation expiry checks.
 */
export const processReservationExpiryJob = async (
  job: Job<ReservationExpiryJobData>,
): Promise<void> => {
  const { reservationId } = job.data;

  if (!reservationId) {
    logger.warn(`[ReservationExpiryWorker] Job ${job.id} missing reservationId payload`);
    return;
  }

  try {
    const reservation = await reservationRepository.findById(reservationId);

    // If reservation not found, log warning and finish job cleanly
    if (!reservation) {
      logger.warn(
        `[ReservationExpiryWorker] Reservation not found for expiry check: ${reservationId}`,
      );
      return;
    }

    // Do nothing if reservation is already in a terminal/handled state
    const terminalStatuses: ReservationStatus[] = [
      ReservationStatus.REJECTED,
      ReservationStatus.CANCELLED,
      ReservationStatus.COMPLETED,
      ReservationStatus.EXPIRED,
    ];

    if (terminalStatuses.includes(reservation.status)) {
      logger.info(
        `[ReservationExpiryWorker] Reservation ${reservationId} is already in status '${reservation.status}'. Skipping.`,
      );
      return;
    }

    // Process expiry if reservation is PENDING
    if (reservation.status === ReservationStatus.PENDING) {
      // 1. Update reservation status to EXPIRED
      await reservationRepository.updateStatus(reservationId, ReservationStatus.EXPIRED);

      // 2. Extract linked food ID
      const foodId =
        typeof reservation.food === 'object' && reservation.food !== null
          ? (reservation.food as { _id?: unknown })._id?.toString() || String(reservation.food)
          : String(reservation.food);

      // 3. Revert linked food status to AVAILABLE if currently RESERVED
      if (foodId) {
        const food = await foodRepository.findById(foodId);
        if (food && food.status === FoodStatus.RESERVED) {
          await foodRepository.updateStatus(foodId, FoodStatus.AVAILABLE);
          logger.info(
            `[ReservationExpiryWorker] Reverted food ${foodId} status from RESERVED to AVAILABLE following reservation expiry`,
          );
        }
      }

      logger.info(
        `[ReservationExpiryWorker] Reservation ${reservationId} successfully marked as EXPIRED`,
      );
    }
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[ReservationExpiryWorker] Error processing expiry for reservationId ${reservationId}: ${err.message}`,
      { error: err.message, stack: err.stack },
    );
    // Rethrow to let BullMQ handle retries based on the backoff strategy
    throw error;
  }
};

/**
 * Initialize the Reservation Expiry BullMQ Worker.
 * Must be called after Redis connection is established.
 */
export const initReservationExpiryWorker = (): Worker<ReservationExpiryJobData> => {
  if (reservationExpiryWorker) return reservationExpiryWorker;

  const connection = getRedisClient();

  reservationExpiryWorker = new Worker<ReservationExpiryJobData>(
    RESERVATION_EXPIRY_QUEUE,
    processReservationExpiryJob,
    {
      connection,
      concurrency: 5,
    },
  );

  reservationExpiryWorker.on('completed', (job) => {
    logger.info(`[ReservationExpiryWorker] Job ${job.id} completed successfully`);
  });

  reservationExpiryWorker.on('failed', (job, err) => {
    logger.error(
      `[ReservationExpiryWorker] Job ${job?.id} failed with error: ${err.message}`,
      { error: err.message, stack: err.stack },
    );
  });

  reservationExpiryWorker.on('error', (err) => {
    logger.error(`[ReservationExpiryWorker] Worker error: ${err.message}`, {
      error: err.message,
      stack: err.stack,
    });
  });

  logger.info('ReservationExpiryWorker initialized successfully');
  return reservationExpiryWorker;
};

/**
 * Gracefully shut down the Reservation Expiry Worker.
 */
export const closeReservationExpiryWorker = async (): Promise<void> => {
  if (reservationExpiryWorker) {
    await reservationExpiryWorker.close();
    reservationExpiryWorker = null;
    logger.info('ReservationExpiryWorker closed gracefully');
  }
};
