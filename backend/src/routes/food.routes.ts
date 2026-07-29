import { Router } from 'express';
import { foodController } from '../controllers/food.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { UserRole } from '../models/user.model';
import {
  createFoodSchema,
  updateFoodSchema,
  updateFoodStatusSchema,
  foodQuerySchema,
} from '../validations/food.validation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coordinates:
 *       type: object
 *       required:
 *         - latitude
 *         - longitude
 *       properties:
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           example: 19.076
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           example: 72.877
 *
 *     Location:
 *       type: object
 *       required:
 *         - address
 *         - city
 *         - state
 *         - postalCode
 *         - country
 *         - coordinates
 *       properties:
 *         address:
 *           type: string
 *           example: "123 Main Street"
 *         city:
 *           type: string
 *           example: "Mumbai"
 *         state:
 *           type: string
 *           example: "Maharashtra"
 *         postalCode:
 *           type: string
 *           example: "400001"
 *         country:
 *           type: string
 *           example: "India"
 *         coordinates:
 *           $ref: '#/components/schemas/Coordinates'
 *
 *     Food:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 65b2f1e4a3b8c9d0e1f2a3b5
 *         title:
 *           type: string
 *           example: "Fresh Rice and Dal"
 *         description:
 *           type: string
 *           example: "Freshly prepared surplus rice and dal from corporate event."
 *         category:
 *           type: string
 *           enum: [cooked, raw, packaged, bakery, dairy, beverages, fruits, vegetables, grains, snacks, other]
 *           example: cooked
 *         quantity:
 *           type: number
 *           example: 25
 *         quantityUnit:
 *           type: string
 *           example: "servings"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/food1.jpg"]
 *         preparedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T12:00:00.000Z"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T18:00:00.000Z"
 *         isVegetarian:
 *           type: boolean
 *           example: true
 *         isVegan:
 *           type: boolean
 *           example: false
 *         containsAllergens:
 *           type: boolean
 *           example: false
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         donor:
 *           type: string
 *           example: 65b2f1e4a3b8c9d0e1f2a3b4
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         pickupStartTime:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T13:00:00.000Z"
 *         pickupEndTime:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T17:00:00.000Z"
 *         status:
 *           type: string
 *           enum: [available, reserved, picked_up, delivered, expired, cancelled]
 *           example: available
 *         isExpired:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T12:05:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T12:05:00.000Z"
 *
 *     CreateFoodRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - quantity
 *         - quantityUnit
 *         - preparedAt
 *         - expiresAt
 *         - location
 *         - pickupStartTime
 *         - pickupEndTime
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "Fresh Rice and Dal"
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           example: "Freshly prepared surplus rice and dal from corporate event."
 *         category:
 *           type: string
 *           enum: [cooked, raw, packaged, bakery, dairy, beverages, fruits, vegetables, grains, snacks, other]
 *           example: cooked
 *         quantity:
 *           type: number
 *           minimum: 1
 *           example: 25
 *         quantityUnit:
 *           type: string
 *           example: "servings"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/food1.jpg"]
 *         preparedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T12:00:00.000Z"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T18:00:00.000Z"
 *         isVegetarian:
 *           type: boolean
 *           default: false
 *           example: true
 *         isVegan:
 *           type: boolean
 *           default: false
 *           example: false
 *         containsAllergens:
 *           type: boolean
 *           default: false
 *           example: false
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         pickupStartTime:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T13:00:00.000Z"
 *         pickupEndTime:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T17:00:00.000Z"
 *
 *     UpdateFoodRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated Fresh Rice and Dal"
 *         description:
 *           type: string
 *           example: "Updated description for surplus food."
 *         category:
 *           type: string
 *           enum: [cooked, raw, packaged, bakery, dairy, beverages, fruits, vegetables, grains, snacks, other]
 *         quantity:
 *           type: number
 *         quantityUnit:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         preparedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         isVegetarian:
 *           type: boolean
 *         isVegan:
 *           type: boolean
 *         containsAllergens:
 *           type: boolean
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *         pickupStartTime:
 *           type: string
 *           format: date-time
 *         pickupEndTime:
 *           type: string
 *           format: date-time
 *
 *     UpdateFoodStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [available, reserved, picked_up, delivered, expired, cancelled]
 *           example: reserved
 *
 *     FoodStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 10
 *         available:
 *           type: integer
 *           example: 4
 *         reserved:
 *           type: integer
 *           example: 2
 *         pickedUp:
 *           type: integer
 *           example: 1
 *         delivered:
 *           type: integer
 *           example: 2
 *         expired:
 *           type: integer
 *           example: 1
 *         cancelled:
 *           type: integer
 *           example: 0
 *
 *     FoodResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: Food listing details fetched successfully
 *         data:
 *           $ref: '#/components/schemas/Food'
 *
 *     PaginatedFoodResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: Available food listings fetched successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Food'
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 25
 *             totalPages:
 *               type: integer
 *               example: 3
 */

/**
 * @swagger
 * /food:
 *   get:
 *     summary: Get all available food listings
 *     description: Retrieves paginated available food listings with optional filtering by category, status, city, diet, and date.
 *     tags: [Food]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field name to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [cooked, raw, packaged, bakery, dairy, beverages, fruits, vegetables, grains, snacks, other]
 *         description: Filter by food category
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by location city
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, reserved, picked_up, delivered, expired, cancelled]
 *         description: Filter by listing status
 *       - in: query
 *         name: vegetarian
 *         schema:
 *           type: boolean
 *         description: Filter by vegetarian flag
 *       - in: query
 *         name: vegan
 *         schema:
 *           type: boolean
 *         description: Filter by vegan flag
 *     responses:
 *       200:
 *         description: Available food listings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedFoodResponse'
 */
router.get('/', validate(foodQuerySchema), foodController.getAvailableFood);

/**
 * @swagger
 * /food/nearby:
 *   get:
 *     summary: Find nearby food donations
 *     description: Retrieves available food listings near a given latitude and longitude using a 2dsphere index.
 *     tags: [Food]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         example: 19.076
 *         description: Center point latitude
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         example: 72.877
 *         description: Center point longitude
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *           default: 10
 *         description: Radius in kilometers
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
 *     responses:
 *       200:
 *         description: Nearby food listings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedFoodResponse'
 */
router.get('/nearby', validate(foodQuerySchema), foodController.getNearbyFood);

/**
 * @swagger
 * /food/my:
 *   get:
 *     summary: Get authenticated donor listings
 *     description: Retrieves all food listings created by the currently authenticated donor.
 *     tags: [Food]
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: My food listings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedFoodResponse'
 *       401:
 *         description: Unauthorized - missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires DONOR or ADMIN role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/my',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(foodQuerySchema),
  foodController.getMyFood,
);

/**
 * @swagger
 * /food/my/statistics:
 *   get:
 *     summary: Get donor statistics
 *     description: Retrieves aggregate count statistics for food listings created by the authenticated donor.
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Food statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Food statistics fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/FoodStatistics'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires DONOR or ADMIN role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/my/statistics',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  foodController.getFoodStatistics,
);

/**
 * @swagger
 * /food/{id}:
 *   get:
 *     summary: Get food listing by ID
 *     description: Retrieves full details of a specific food listing with populated donor information.
 *     tags: [Food]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Food listing ID
 *     responses:
 *       200:
 *         description: Food listing details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodResponse'
 *       404:
 *         description: Food listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', foodController.getFoodById);

/**
 * @swagger
 * /food:
 *   post:
 *     summary: Create food listing
 *     description: Creates a new food donation listing (DONOR or ADMIN role required).
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFoodRequest'
 *     responses:
 *       201:
 *         description: Food donation listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Food donation listing created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - account unverified, inactive, or invalid role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(createFoodSchema),
  foodController.createFood,
);

/**
 * @swagger
 * /food/{id}:
 *   patch:
 *     summary: Update food listing
 *     description: Updates details of an existing food listing (owner only).
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Food listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFoodRequest'
 *     responses:
 *       200:
 *         description: Food listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodResponse'
 *       400:
 *         description: Validation error or illegal modification of delivered/cancelled listing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not listing owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Food listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateFoodSchema),
  foodController.updateFood,
);

/**
 * @swagger
 * /food/{id}/status:
 *   patch:
 *     summary: Update food status
 *     description: Updates status state transition for a food listing (owner only).
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Food listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFoodStatusRequest'
 *     responses:
 *       200:
 *         description: Food listing status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodResponse'
 *       400:
 *         description: Invalid status state transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not listing owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Food listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateFoodStatusSchema),
  foodController.updateFoodStatus,
);

/**
 * @swagger
 * /food/{id}:
 *   delete:
 *     summary: Delete food listing
 *     description: Deletes an existing food listing (owner only). Delivered listings cannot be deleted.
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Food listing ID
 *     responses:
 *       200:
 *         description: Food listing deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Food listing deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not listing owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Food listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  foodController.deleteFood,
);

export default router;
