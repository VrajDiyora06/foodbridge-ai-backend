import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../database';
import { EMAIL_QUEUE } from './queueNames';
import { emailService } from '../services/email.service';
import logger from '../utils/logger';

export interface EmailJobData {
  type: string;
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export let emailWorker: Worker<EmailJobData> | null = null;

/**
 * Job processor function for email queue.
 * Validates payload, renders template, and dispatches email via EmailService SMTP transporter.
 */
export const processEmailJob = async (job: Job<EmailJobData>): Promise<void> => {
  const { type, to, subject, template, data } = job.data;

  // Validate payload — log warning and exit cleanly without rethrowing for invalid payload
  if (!to || !subject || !template) {
    logger.warn(
      `[EmailWorker] Job ${job.id} contains invalid payload — missing required fields (to, subject, template)`,
      { payload: job.data },
    );
    return;
  }

  try {
    // Render email HTML & text templates
    const { html, text } = emailService.renderTemplate(template, data || {});

    // Dispatch email via Nodemailer SMTP
    await emailService.sendEmail({
      to,
      subject,
      html,
      text,
    });

    logger.info(`[EmailWorker] Email job ${job.id} dispatched successfully to ${to} [Template: ${template}]`, {
      jobId: job.id,
      type: type || 'general',
      to,
      subject,
      template,
      status: 'completed',
    });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `[EmailWorker] SMTP delivery error processing job ${job.id} for recipient ${to}: ${err.message}`,
      { error: err.message, stack: err.stack },
    );
    // Rethrow SMTP error so BullMQ handles automated retries
    throw error;
  }
};

/**
 * Initialize the Email Queue BullMQ Worker.
 * Must be called after Redis connection is established.
 */
export const initEmailWorker = (): Worker<EmailJobData> => {
  if (emailWorker) return emailWorker;

  const connection = getRedisClient();

  emailWorker = new Worker<EmailJobData>(EMAIL_QUEUE, processEmailJob, {
    connection,
    concurrency: 5,
  });

  emailWorker.on('completed', (job) => {
    logger.info(`[EmailWorker] Job ${job.id} completed successfully`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`[EmailWorker] Job ${job?.id} failed with error: ${err.message}`, {
      error: err.message,
      stack: err.stack,
    });
  });

  emailWorker.on('stalled', (jobId) => {
    logger.warn(`[EmailWorker] Job ${jobId} stalled`);
  });

  emailWorker.on('error', (err) => {
    logger.error(`[EmailWorker] Worker error: ${err.message}`, {
      error: err.message,
      stack: err.stack,
    });
  });

  logger.info('EmailWorker initialized successfully');
  return emailWorker;
};

/**
 * Gracefully shut down the Email Worker.
 */
export const closeEmailWorker = async (): Promise<void> => {
  if (emailWorker) {
    await emailWorker.close();
    emailWorker = null;
    logger.info('EmailWorker closed gracefully');
  }
};
