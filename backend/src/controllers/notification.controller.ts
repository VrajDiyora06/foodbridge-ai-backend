import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotificationService, notificationService as defaultService } from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';
import { NotificationType } from '../models/notification.model';

export class NotificationController {
  private readonly notificationService: NotificationService;

  constructor(service: NotificationService = defaultService) {
    this.notificationService = service;
  }

  /**
   * GET /api/v1/notifications
   * Get user notifications with pagination and unread filter.
   */
  getNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const { page, limit, unreadOnly, type } = req.query;

    const filters = {
      unreadOnly: unreadOnly === 'true',
      type: typeof type === 'string' ? (type as NotificationType) : undefined,
    };

    const options = {
      page: typeof page === 'string' ? parseInt(page, 10) : 1,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : 10,
    };

    const result = await this.notificationService.getUserNotifications(authReq.userId, filters, options);

    ApiResponse.paginated(
      res,
      result.data,
      result.page,
      result.limit,
      result.total,
      'Notifications retrieved successfully',
    );
  });

  /**
   * GET /api/v1/notifications/:id
   * Get single notification details.
   */
  getNotificationById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    const notification = await this.notificationService.getNotificationById(id, authReq.userId);
    ApiResponse.ok(res, notification, 'Notification details retrieved successfully');
  });

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark notification as read.
   */
  markRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    const notification = await this.notificationService.markRead(id, authReq.userId);
    ApiResponse.ok(res, notification, 'Notification marked as read');
  });

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all notifications as read for current user.
   */
  markAllRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const result = await this.notificationService.markAllRead(authReq.userId);
    ApiResponse.ok(res, result, 'All notifications marked as read');
  });

  /**
   * DELETE /api/v1/notifications/:id
   * Delete notification by ID.
   */
  deleteNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    await this.notificationService.deleteNotification(id, authReq.userId);
    ApiResponse.ok(res, null, 'Notification deleted successfully');
  });

  /**
   * POST /api/v1/notifications/broadcast
   * Admin: Broadcast notification to all or specific roles.
   */
  broadcast = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    await this.notificationService.broadcastNotification(authReq.userId, req.body);
    ApiResponse.accepted(res, null, 'Broadcast notification queued successfully');
  });
}

export const notificationController = new NotificationController();
