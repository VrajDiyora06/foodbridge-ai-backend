import { socketManager } from '../socketManager';
import logger from '../../utils/logger';

export enum FoodSocketEvents {
  CREATED = 'food:created',
  UPDATED = 'food:updated',
  DELETED = 'food:deleted',
  EXPIRED = 'food:expired',
}

/**
 * Emit real-time socket event when a new food donation is created.
 */
export const emitFoodCreated = (food: unknown): void => {
  try {
    socketManager.emit(FoodSocketEvents.CREATED, food);
  } catch (error) {
    const err = error as Error;
    logger.error(`[Socket.IO] Failed to emit '${FoodSocketEvents.CREATED}': ${err.message}`);
  }
};

/**
 * Emit real-time socket event when a food donation is updated.
 */
export const emitFoodUpdated = (food: unknown): void => {
  try {
    socketManager.emit(FoodSocketEvents.UPDATED, food);
  } catch (error) {
    const err = error as Error;
    logger.error(`[Socket.IO] Failed to emit '${FoodSocketEvents.UPDATED}': ${err.message}`);
  }
};

/**
 * Emit real-time socket event when a food donation listing is deleted.
 */
export const emitFoodDeleted = (foodId: string): void => {
  try {
    socketManager.emit(FoodSocketEvents.DELETED, { foodId });
  } catch (error) {
    const err = error as Error;
    logger.error(`[Socket.IO] Failed to emit '${FoodSocketEvents.DELETED}': ${err.message}`);
  }
};

/**
 * Emit real-time socket event when a food listing expires.
 */
export const emitFoodExpired = (foodId: string | unknown): void => {
  try {
    socketManager.emit(FoodSocketEvents.EXPIRED, typeof foodId === 'string' ? { foodId } : foodId);
  } catch (error) {
    const err = error as Error;
    logger.error(`[Socket.IO] Failed to emit '${FoodSocketEvents.EXPIRED}': ${err.message}`);
  }
};
