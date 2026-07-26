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
 * Static routes (must come before parameterized /:id routes)
 */
router.get(
  '/my',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER),
  validate(reservationQuerySchema),
  reservationController.getMyReservations,
);

router.get(
  '/my/statistics',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER),
  reservationController.getReservationStatistics,
);

/**
 * Parameterized detail route
 */
router.get(
  '/:id',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER, UserRole.DONOR, UserRole.ADMIN),
  reservationController.getReservationById,
);

/**
 * Reservation mutations
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER),
  validate(createReservationSchema),
  reservationController.createReservation,
);

router.patch(
  '/:id/accept',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateReservationStatusSchema),
  reservationController.acceptReservation,
);

router.patch(
  '/:id/reject',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateReservationStatusSchema),
  reservationController.rejectReservation,
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize(UserRole.NGO, UserRole.VOLUNTEER),
  validate(cancelReservationSchema),
  reservationController.cancelReservation,
);

router.patch(
  '/:id/pickup',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateReservationStatusSchema),
  reservationController.markPickedUp,
);

router.patch(
  '/:id/complete',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateReservationStatusSchema),
  reservationController.completeReservation,
);

export default router;
