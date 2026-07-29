import { socketManager } from '../socketManager';
import logger from '../../utils/logger';

export enum ReservationSocketEvents {
  CREATED = 'reservation:created',
  ACCEPTED = 'reservation:accepted',
  REJECTED = 'reservation:rejected',
  CANCELLED = 'reservation:cancelled',
  PICKED_UP = 'reservation:picked_up',
  COMPLETED = 'reservation:completed',
  EXPIRED = 'reservation:expired',
}

/**
 * Emit real-time socket event when a new food reservation claim is created.
 */
export const emitReservationCreated = (reservation: unknown): void => {
  try {
    socketManager.emit(ReservationSocketEvents.CREATED, reservation);
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[Socket.IO] Failed to emit '${ReservationSocketEvents.CREATED}': ${err.message}`,
    );
  }
};

/**
 * Emit real-time socket event when a reservation is accepted.
 */
export const emitReservationAccepted = (reservation: unknown): void => {
  try {
    socketManager.emit(ReservationSocketEvents.ACCEPTED, reservation);
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[Socket.IO] Failed to emit '${ReservationSocketEvents.ACCEPTED}': ${err.message}`,
    );
  }
};

/**
 * Emit real-time socket event when a reservation is rejected.
 */
export const emitReservationRejected = (reservation: unknown): void => {
  try {
    socketManager.emit(ReservationSocketEvents.REJECTED, reservation);
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[Socket.IO] Failed to emit '${ReservationSocketEvents.REJECTED}': ${err.message}`,
    );
  }
};

/**
 * Emit real-time socket event when a reservation is cancelled.
 */
export const emitReservationCancelled = (reservation: unknown): void => {
  try {
    socketManager.emit(ReservationSocketEvents.CANCELLED, reservation);
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[Socket.IO] Failed to emit '${ReservationSocketEvents.CANCELLED}': ${err.message}`,
    );
  }
};

/**
 * Emit real-time socket event when a reservation is picked up.
 */
export const emitReservationPickedUp = (reservation: unknown): void => {
  try {
    socketManager.emit(ReservationSocketEvents.PICKED_UP, reservation);
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[Socket.IO] Failed to emit '${ReservationSocketEvents.PICKED_UP}': ${err.message}`,
    );
  }
};

/**
 * Emit real-time socket event when a reservation is completed.
 */
export const emitReservationCompleted = (reservation: unknown): void => {
  try {
    socketManager.emit(ReservationSocketEvents.COMPLETED, reservation);
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[Socket.IO] Failed to emit '${ReservationSocketEvents.COMPLETED}': ${err.message}`,
    );
  }
};

/**
 * Emit real-time socket event when a reservation expires.
 */
export const emitReservationExpired = (reservationId: string | unknown): void => {
  try {
    socketManager.emit(
      ReservationSocketEvents.EXPIRED,
      typeof reservationId === 'string' ? { reservationId } : reservationId,
    );
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[Socket.IO] Failed to emit '${ReservationSocketEvents.EXPIRED}': ${err.message}`,
    );
  }
};
