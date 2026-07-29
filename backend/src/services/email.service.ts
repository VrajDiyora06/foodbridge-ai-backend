import nodemailer, { Transporter } from 'nodemailer';
import env from '../config/env.config';
import logger from '../utils/logger';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface RenderedTemplate {
  html: string;
  text: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  /**
   * Initialize Nodemailer transport using environment variables.
   */
  private initTransporter(): void {
    const isAuthAvailable = !!(env.smtpUser && env.smtpPassword);

    this.transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      ...(isAuthAvailable
        ? {
            auth: {
              user: env.smtpUser,
              pass: env.smtpPassword,
            },
          }
        : {}),
    });
  }

  /**
   * Send an email via Nodemailer.
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.transporter) {
      this.initTransporter();
    }

    const mailOptions = {
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || this.stripHtml(options.html),
    };

    try {
      const info = await this.transporter!.sendMail(mailOptions);
      logger.info('Email sent successfully via SMTP', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
    } catch (error) {
      const err = error as Error;
      logger.error('SMTP email delivery failed', {
        to: options.to,
        subject: options.subject,
        error: err.message,
      });
      // Throw error so BullMQ worker retries
      throw error;
    }
  }

  /**
   * Render HTML and plain text for email templates based on payload data.
   */
  renderTemplate(templateName: string, data: Record<string, unknown>): RenderedTemplate {
    const name = String(data.name || 'User');
    const clientUrl = String(data.clientUrl || env.clientUrl);
    const normalizedTemplate = templateName.toLowerCase().replace(/_/g, '-');

    switch (normalizedTemplate) {
      case 'verify-email':
      case 'verification-email': {
        const token = String(data.verificationToken || data.token || '');
        const verificationLink = `${clientUrl}/verify-email?token=${token}`;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; background-color: #f4f6f8; color: #333; margin: 0; padding: 20px; }
                .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .btn { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 16px; }
                .footer { font-size: 12px; color: #6b7280; margin-top: 24px; text-align: center; }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>Welcome to FoodBridge AI</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>Thank you for registering with FoodBridge AI. Please verify your email address to activate your account and start redistributing food.</p>
                <a href="${verificationLink}" class="btn">Verify Email Address</a>
                <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">If the button above does not work, copy and paste the following URL into your browser:</p>
                <p style="font-size: 13px; color: #10b981; word-break: break-all;">${verificationLink}</p>
                <div class="footer">&copy; ${new Date().getFullYear()} FoodBridge AI. All rights reserved.</div>
              </div>
            </body>
          </html>
        `;

        const text = `Hi ${name},\n\nThank you for registering with FoodBridge AI. Please verify your email address by visiting the link below:\n\n${verificationLink}\n\nFoodBridge AI Team`;

        return { html, text };
      }

      case 'password-reset':
      case 'reset-password': {
        const token = String(data.resetToken || data.token || '');
        const resetLink = `${clientUrl}/reset-password?token=${token}`;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; background-color: #f4f6f8; color: #333; margin: 0; padding: 20px; }
                .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .btn { display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 16px; }
                .footer { font-size: 12px; color: #6b7280; margin-top: 24px; text-align: center; }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>Reset Your Password</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>We received a request to reset your FoodBridge AI account password. Click the button below to set a new password:</p>
                <a href="${resetLink}" class="btn">Reset Password</a>
                <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">If you did not request a password reset, you can safely ignore this email.</p>
                <p style="font-size: 13px; color: #ef4444; word-break: break-all;">${resetLink}</p>
                <div class="footer">&copy; ${new Date().getFullYear()} FoodBridge AI. All rights reserved.</div>
              </div>
            </body>
          </html>
        `;

        const text = `Hi ${name},\n\nWe received a request to reset your FoodBridge AI password. Reset your password by visiting:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`;

        return { html, text };
      }

      default: {
        const html = `
          <!DOCTYPE html>
          <html>
            <body>
              <p>Hello ${name},</p>
              <p>You have a notification from FoodBridge AI.</p>
            </body>
          </html>
        `;
        const text = `Hello ${name},\n\nYou have a notification from FoodBridge AI.`;
        return { html, text };
      }
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '').trim();
  }
}

export const emailService = new EmailService();
