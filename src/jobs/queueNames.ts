/**
 * BullMQ Queue Name Constants
 */
export const FOOD_EXPIRY_QUEUE = 'food-expiry-queue';
export const RESERVATION_EXPIRY_QUEUE = 'reservation-expiry-queue';
export const EMAIL_QUEUE = 'email-queue';

export const QUEUE_NAMES = {
  FOOD_EXPIRY: FOOD_EXPIRY_QUEUE,
  RESERVATION_EXPIRY: RESERVATION_EXPIRY_QUEUE,
  EMAIL: EMAIL_QUEUE,
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
