import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate, authenticate, authorize } from '../middlewares';
import { UserRole } from '../models/user.model';
import {
  updateProfileSchema,
  updateStatusSchema,
  updateRoleSchema,
  userQuerySchema,
} from '../validations/user.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and administrative user management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 64f1a2b3c4d5e6f7a8b9c0d1
 *         name:
 *           type: string
 *           example: Jane Doe
 *         email:
 *           type: string
 *           example: jane@example.com
 *         role:
 *           type: string
 *           enum: [user, donor, ngo, volunteer, admin]
 *           example: donor
 *         accountStatus:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: active
 *         isVerified:
 *           type: boolean
 *           example: true
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "+1234567890"
 *         address:
 *           type: string
 *           nullable: true
 *           example: "123 Main St, San Francisco, CA"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/avatar.jpg"
 *         organizationName:
 *           type: string
 *           nullable: true
 *           example: "Helping Hands NGO"
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Jane Doe Updated
 *         phone:
 *           type: string
 *           example: "+1987654321"
 *         address:
 *           type: string
 *           example: "456 Market St, San Francisco, CA"
 *         avatar:
 *           type: string
 *           example: "https://example.com/new-avatar.jpg"
 *         organizationName:
 *           type: string
 *           example: "Food Bridge Foundation"
 *     UpdateStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: suspended
 *     UpdateRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, donor, ngo, volunteer, admin]
 *           example: ngo
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input or attempt to update protected fields
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, validate(updateProfileSchema), userController.updateMe);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Admin: List and filter users with pagination
 *     tags: [Users]
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
 *           enum: [user, donor, ngo, volunteer, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, phone, or organization name
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/', authenticate, authorize(UserRole.ADMIN), validate(userQuerySchema), userController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Admin: Get user details by ID
 *     tags: [Users]
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
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, authorize(UserRole.ADMIN), userController.getUserById);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Admin: Update user account status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN), validate(updateStatusSchema), userController.updateStatus);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Admin: Update user role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', authenticate, authorize(UserRole.ADMIN), validate(updateRoleSchema), userController.updateRole);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Admin: Soft delete user account
 *     tags: [Users]
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
 *         description: User account soft deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), userController.deleteUser);

export default router;
