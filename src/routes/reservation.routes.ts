import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { UserRole } from '../models/user.model';
import {
  createReservationSchema,
  updateReservationStatusSchema,
  reservationQuerySchema,
  cancelReservationSchema,
} from '../validations/reservation.validation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 65b2f1e4a3b8c9d0e1f2a3c1
 *         food:
 *           type: string
 *           example: 65b2f1e4a3b8c9d0e1f2a3b5
 *         claimer:
 *           type: string
 *           example: 65b2f1e4a3b8c9d0e1f2a3b4
 *         claimerRole:
 *           type: string
 *           enum: [ngo, volunteer]
 *           example: ngo
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, picked_up, completed, expired]
 *           example: pending
 *         pickupTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-07-26T14:00:00.000Z"
 *         notes:
 *           type: string
 *           example: "Will pick up using refrigerator vehicle."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-26T12:00:00.000Z"
 *
 *     ReservationStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 12
 *         pending:
 *           type: integer
 *           example: 3
 *         accepted:
 *           type: integer
 *           example: 4
 *         completed:
 *           type: integer
 *           example: 4
 *         cancelled:
 *           type: integer
 *           example: 1
 *
 *     CreateReservationRequest:
 *       type: object
 *       required:
 *         - foodId
 *       properties:
 *         foodId:
 *           type: string
 *           example: 65b2f1e4a3b8c9d0e1f2a3b5
 *         notes:
 *           type: string
 *           maxLength: 500
 *           example: "Will pick up using refrigerator vehicle."
 *
 *     CancelReservationRequest:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           maxLength: 300
 *           example: "Vehicle malfunction during transit."
 *
 *     ReservationResponse:
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
 *           example: Reservation details fetched successfully
 *         data:
 *           $ref: '#/components/schemas/Reservation'
 *
 *     PaginatedReservationResponse:
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
 *           example: My reservations fetched successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Reservation'
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
 *               example: 12
 *             totalPages:
 *               type: integer
 *               example: 2
 *
 *     ReservationStatusUpdateResponse:
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
 *           example: Reservation status updated successfully
 *         data:
 *           $ref: '#/components/schemas/Reservation'
 */

/**
 * @swagger
 * /reservations/my:
 *   get:
 *     summary: Get authenticated user reservations
 *     description: Retrieves paginated food reservations claimed by the authenticated NGO or Volunteer.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
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
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, pickupTime]
 *           default: createdAt
 *         description: Field name to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, picked_up, completed, expired]
 *         description: Filter by reservation status
 *       - in: query
 *         name: claimerRole
 *         schema:
 *           type: string
 *           enum: [ngo, volunteer]
 *         description: Filter by claimer role
 *     responses:
 *       200:
 *         description: My reservations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedReservationResponse'
 *       401:
 *         description: Unauthorized - missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires NGO or VOLUNTEER role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/my',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER),
  validate(reservationQuerySchema),
  reservationController.getMyReservations,
);

/**
 * @swagger
 * /reservations/my/statistics:
 *   get:
 *     summary: Get reservation statistics
 *     description: Retrieves aggregate count statistics for reservations claimed by the authenticated user.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservation statistics fetched successfully
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
 *                   example: Reservation statistics fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/ReservationStatistics'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires NGO or VOLUNTEER role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/my/statistics',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER),
  reservationController.getReservationStatistics,
);

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Get reservation details by ID
 *     description: Retrieves full details of a reservation populated with food and claimer information.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:id',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER, UserRole.DONOR, UserRole.ADMIN),
  reservationController.getReservationById,
);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create reservation claim
 *     description: Creates a new food reservation claim for an available food listing (NGO or Volunteer role required).
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservationRequest'
 *     responses:
 *       201:
 *         description: Reservation created successfully
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
 *                   example: Reservation created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Validation error or food unavailable/expired/already reserved
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
 *       404:
 *         description: Food listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER),
  validate(createReservationSchema),
  reservationController.createReservation,
);

/**
 * @swagger
 * /reservations/{id}/accept:
 *   patch:
 *     summary: Accept reservation
 *     description: Accepts a pending food reservation claim (Donor owner or Admin required).
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationStatusUpdateResponse'
 *       400:
 *         description: Reservation not in pending status
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
 *         description: Forbidden - not food donor owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/accept',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateReservationStatusSchema),
  reservationController.acceptReservation,
);

/**
 * @swagger
 * /reservations/{id}/reject:
 *   patch:
 *     summary: Reject reservation
 *     description: Rejects a pending food reservation claim and returns food to available status (Donor owner or Admin required).
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationStatusUpdateResponse'
 *       400:
 *         description: Reservation not in pending status
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
 *         description: Forbidden - not food donor owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/reject',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateReservationStatusSchema),
  reservationController.rejectReservation,
);

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Cancel reservation
 *     description: Cancels a pending or accepted reservation claim and returns food to available status (Claimer owner required).
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelReservationRequest'
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationStatusUpdateResponse'
 *       400:
 *         description: Reservation not in pending or accepted status
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
 *         description: Forbidden - not claimer owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/cancel',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER),
  validate(cancelReservationSchema),
  reservationController.cancelReservation,
);

/**
 * @swagger
 * /reservations/{id}/pickup:
 *   patch:
 *     summary: Mark reservation as picked up
 *     description: Marks an accepted reservation as picked up (Donor owner or Admin required).
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation marked as picked up
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationStatusUpdateResponse'
 *       400:
 *         description: Reservation not in accepted status
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
 *         description: Forbidden - not food donor owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/pickup',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateReservationStatusSchema),
  reservationController.markPickedUp,
);

/**
 * @swagger
 * /reservations/{id}/complete:
 *   patch:
 *     summary: Complete reservation
 *     description: Marks a picked up reservation as completed and food status as delivered (Donor owner or Admin required).
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationStatusUpdateResponse'
 *       400:
 *         description: Reservation not in picked_up status
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
 *         description: Forbidden - not food donor owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/complete',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateReservationStatusSchema),
  reservationController.completeReservation,
);

export default router;
