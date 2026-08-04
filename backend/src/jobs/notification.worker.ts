import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../database';
import logger from '../utils/logger';
import { NOTIFICATION_QUEUE } from './queueNames';
import { notificationRepository, CreateNotificationData } from '../repositories/notification.repository';
import { emitNotificationNew, emitNotificationBroadcast } from '../socket/events/notification.events';
import { NotificationType, NotificationPriority } from '../models/notification.model';
import { UserRole } from '../models/user.model';

export interface NotificationJobPayload {
  mode?: 'single' | 'broadcast';
  recipient?: string;
  sender?: string;
  title: string;
  message: string;
  type?: NotificationType;
  relatedEntityId?: string;
  relatedEntityType?: string;
  priority?: NotificationPriority;
  targetRole?: 'all' | UserRole;
}

export let notificationWorker: Worker;

/**
 * Worker processor function for handling notification delivery jobs.
 */
export const processNotificationJob = async (job: Job<NotificationJobPayload>): Promise<string> => {
  const { mode = 'single', recipient, sender, title, message, type, relatedEntityId, relatedEntityType, priority, targetRole } = job.data;

  logger.info(`[NotificationWorker] Processing job ${job.id}`, { jobId: job.id, mode });

  if (mode === 'broadcast') {
    const role = targetRole || 'all';
    const count = await notificationRepository.broadcast(
      role,
      { title, message, type, priority },
      sender,
    );

    emitNotificationBroadcast({
      title,
      message,
      targetRole: role,
      type,
      priority,
      createdAt: new Date(),
    });

    return `Broadcasted notification to ${count} users`;
  }

  if (!recipient) {
    throw new Error("Recipient ID is required for single notification job");
  }

  const notificationData: CreateNotificationData = {
    recipient,
    sender,
    title,
    message,
    type,
    relatedEntityId,
    relatedEntityType,
    priority,
  };

  const notificationDoc = await notificationRepository.create(notificationData);

  // Emit real-time Socket.IO event
  emitNotificationNew(recipient, notificationDoc);

  return `Notification created and emitted to user ${recipient}`;
};

/**
 * Initialize BullMQ Worker for notification queue.
 */
export const initNotificationWorker = (): Worker => {
  if (notificationWorker) {
    logger.warn('[NotificationWorker] Worker already initialized');
    return notificationWorker;
  }

  const connection = getRedisClient();

  notificationWorker = new Worker<NotificationJobPayload>(
    NOTIFICATION_QUEUE,
    processNotificationJob,
    {
      connection,
      concurrency: 5,
    },
  );

  notificationWorker.on('completed', (job: Job) => {
    logger.info(`[NotificationWorker] Job ${job.id} completed successfully`);
  });

  notificationWorker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(`[NotificationWorker] Job ${job?.id || 'unknown'} failed`, {
      error: err.message,
      stack: err.stack,
    });
  });

  logger.info('NotificationWorker initialized successfully');
  return notificationWorker;
};

/**
 * Gracefully close NotificationWorker.
 */
export const closeNotificationWorker = async (): Promise<void> => {
  if (notificationWorker) {
    logger.info('Closing NotificationWorker...');
    await notificationWorker.close();
    logger.info('NotificationWorker closed');
  }
};
