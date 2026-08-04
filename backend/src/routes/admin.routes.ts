import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { validate, authenticate, authorize } from '../middlewares';
import { UserRole } from '../models/user.model';
import { userQuerySchema } from '../validations/user.validation';
import {
  adminFoodQuerySchema,
  adminReservationQuerySchema,
} from '../validations/admin.validation';

const router = Router();

// All routes require Admin Authentication & Authorization
router.use(authenticate, authorize(UserRole.ADMIN));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative dashboard, analytics, food moderation, and user/reservation monitoring
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get high-level platform dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get platform analytics and time-series metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/analytics', adminController.getAnalytics);

/**
 * @swagger
 * /admin/food:
 *   get:
 *     summary: Admin: View all food donation listings for moderation
 *     tags: [Admin]
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
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food listings queue retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/food', validate(adminFoodQuerySchema), adminController.getFood);

/**
 * @swagger
 * /admin/reservations:
 *   get:
 *     summary: Admin: View all system reservations for monitoring
 *     tags: [Admin]
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: System reservations list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/reservations', validate(adminReservationQuerySchema), adminController.getReservations);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Admin: View all users for monitoring (reuses UserService)
 *     tags: [Admin]
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
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/users', validate(userQuerySchema), adminController.getUsers);

export default router;
