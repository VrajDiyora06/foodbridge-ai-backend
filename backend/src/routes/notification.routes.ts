import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { validate, authenticate, authorize } from '../middlewares';
import { UserRole } from '../models/user.model';
import {
  notificationQuerySchema,
  broadcastNotificationSchema,
} from '../validations/notification.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notification engine and broadcast endpoints
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Retrieve authenticated user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, success, warning, system, donation, reservation]
 *     responses:
 *       200:
 *         description: Notifications list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, validate(notificationQuerySchema), notificationController.getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch('/read-all', authenticate, notificationController.markAllRead);

/**
 * @swagger
 * /notifications/broadcast:
 *   post:
 *     summary: Admin: Broadcast notification to all or targeted user roles
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - targetRole
 *             properties:
 *               title:
 *                 type: string
 *                 example: System Maintenance Notice
 *               message:
 *                 type: string
 *                 example: Scheduled database maintenance tonight at 02:00 UTC.
 *               targetRole:
 *                 type: string
 *                 example: all
 *               type:
 *                 type: string
 *                 example: system
 *               priority:
 *                 type: string
 *                 example: high
 *     responses:
 *       202:
 *         description: Broadcast notification queued successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post('/broadcast', authenticate, authorize(UserRole.ADMIN), validate(broadcastNotificationSchema), notificationController.broadcast);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get single notification details by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification details retrieved successfully
 *       404:
 *         description: Notification not found
 */
router.get('/:id', authenticate, notificationController.getNotificationById);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', authenticate, notificationController.markRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', authenticate, notificationController.deleteNotification);

export default router;
