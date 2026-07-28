import { Queue, QueueEvents, JobsOptions } from 'bullmq';
import { getRedisClient } from '../database';
import logger from '../utils/logger';
import {
  FOOD_EXPIRY_QUEUE,
  RESERVATION_EXPIRY_QUEUE,
  EMAIL_QUEUE,
} from './queueNames';

// ── Queue & Event Singletons ──────────────────────────────────────
export let foodExpiryQueue: Queue;
export let reservationExpiryQueue: Queue;
export let emailQueue: Queue;

const queueEventsList: QueueEvents[] = [];

/**
 * Register standard event listeners (completed, failed, stalled) for a QueueEvents instance.
 */
const setupQueueEvents = (queueName: string, events: QueueEvents): void => {
  events.on('completed', ({ jobId, returnvalue }) => {
    logger.info(`[Queue: ${queueName}] Job completed`, {
      jobId,
      returnvalue: typeof returnvalue === 'string' ? returnvalue : JSON.stringify(returnvalue),
    });
  });

  events.on('failed', ({ jobId, failedReason }) => {
    logger.error(`[Queue: ${queueName}] Job failed`, {
      jobId,
      failedReason,
    });
  });

  events.on('stalled', ({ jobId }) => {
    logger.warn(`[Queue: ${queueName}] Job stalled`, { jobId });
  });
};

/**
 * Initialize all BullMQ queues and event listeners.
 * Must be called after Redis connection is established.
 */
export const initQueues = (): void => {
  const connection = getRedisClient();

  // Create Queue instances
  foodExpiryQueue = new Queue(FOOD_EXPIRY_QUEUE, { connection });
  reservationExpiryQueue = new Queue(RESERVATION_EXPIRY_QUEUE, { connection });
  emailQueue = new Queue(EMAIL_QUEUE, { connection });

  // Create QueueEvents instances and attach listeners
  const foodExpiryEvents = new QueueEvents(FOOD_EXPIRY_QUEUE, { connection });
  setupQueueEvents(FOOD_EXPIRY_QUEUE, foodExpiryEvents);
  queueEventsList.push(foodExpiryEvents);

  const reservationExpiryEvents = new QueueEvents(RESERVATION_EXPIRY_QUEUE, { connection });
  setupQueueEvents(RESERVATION_EXPIRY_QUEUE, reservationExpiryEvents);
  queueEventsList.push(reservationExpiryEvents);

  const emailEvents = new QueueEvents(EMAIL_QUEUE, { connection });
  setupQueueEvents(EMAIL_QUEUE, emailEvents);
  queueEventsList.push(emailEvents);

  logger.info('BullMQ queue infrastructure initialized successfully');
};

// ── Helper Enqueue Functions ─────────────────────────────────────

/**
 * Enqueue a food expiry check job.
 */
export const addFoodExpiryJob = async (
  data: Record<string, unknown> = {},
  opts?: JobsOptions,
) => {
  if (!foodExpiryQueue) {
    throw new Error('foodExpiryQueue is not initialized');
  }
  return foodExpiryQueue.add('check-food-expiry', data, opts);
};

/**
 * Enqueue a reservation expiry check job.
 */
export const addReservationExpiryJob = async (
  data: Record<string, unknown> = {},
  opts?: JobsOptions,
) => {
  if (!reservationExpiryQueue) {
    throw new Error('reservationExpiryQueue is not initialized');
  }
  return reservationExpiryQueue.add('check-reservation-expiry', data, opts);
};

/**
 * Enqueue an email sending job.
 */
export const addEmailJob = async (
  data: Record<string, unknown> = {},
  opts?: JobsOptions,
) => {
  if (!emailQueue) {
    throw new Error('emailQueue is not initialized');
  }
  return emailQueue.add('send-email', data, opts);
};

// ── Graceful Shutdown ─────────────────────────────────────────────

/**
 * Gracefully close all queues and event listeners.
 */
export const closeQueues = async (): Promise<void> => {
  logger.info('Closing BullMQ queues and event listeners...');

  // Close event listeners
  for (const events of queueEventsList) {
    await events.close();
  }
  queueEventsList.length = 0;

  // Close queues
  if (foodExpiryQueue) await foodExpiryQueue.close();
  if (reservationExpiryQueue) await reservationExpiryQueue.close();
  if (emailQueue) await emailQueue.close();

  logger.info('BullMQ queues closed gracefully');
};
