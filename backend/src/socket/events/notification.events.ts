import { socketManager } from '../socketManager';
import logger from '../../utils/logger';

export enum NotificationSocketEvents {
  NEW = 'notification:new',
  READ = 'notification:read',
  DELETED = 'notification:deleted',
  BROADCAST = 'notification:broadcast',
}

/**
 * Emit socket event when a new notification is delivered.
 */
export const emitNotificationNew = (recipientId: string, notification: unknown): void => {
  try {
    socketManager.emit(NotificationSocketEvents.NEW, { recipientId, notification });
  } catch (error) {
    const err = error as Error;
    logger.error(`[Socket.IO] Failed to emit '${NotificationSocketEvents.NEW}': ${err.message}`);
  }
};

/**
 * Emit socket event when a notification is marked as read.
 */
export const emitNotificationRead = (recipientId: string, notificationId?: string): void => {
  try {
    socketManager.emit(NotificationSocketEvents.READ, { recipientId, notificationId });
  } catch (error) {
    const err = error as Error;
    logger.error(`[Socket.IO] Failed to emit '${NotificationSocketEvents.READ}': ${err.message}`);
  }
};

/**
 * Emit socket event when a notification is deleted.
 */
export const emitNotificationDeleted = (recipientId: string, notificationId: string): void => {
  try {
    socketManager.emit(NotificationSocketEvents.DELETED, { recipientId, notificationId });
  } catch (error) {
    const err = error as Error;
    logger.error(`[Socket.IO] Failed to emit '${NotificationSocketEvents.DELETED}': ${err.message}`);
  }
};

/**
 * Emit socket event when a system notification is broadcast to all/role.
 */
export const emitNotificationBroadcast = (payload: unknown): void => {
  try {
    socketManager.broadcast(NotificationSocketEvents.BROADCAST, payload);
  } catch (error) {
    const err = error as Error;
    logger.error(`[Socket.IO] Failed to emit '${NotificationSocketEvents.BROADCAST}': ${err.message}`);
  }
};
