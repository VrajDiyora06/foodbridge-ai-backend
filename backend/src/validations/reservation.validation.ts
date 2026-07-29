import { z } from 'zod';
import { ReservationStatus, ClaimerRole } from '../models/reservation.model';

// ── Reusable Helpers ─────────────────────────────────────

export const objectIdSchema = z
  .string({ required_error: 'ID is required' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Mongo ObjectId');

export const paginationSchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'Page must be a number' })
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number({ invalid_type_error: 'Limit must be a number' })
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
});

export const sortSchema = z.object({
  sortBy: z.enum(['createdAt', 'updatedAt', 'pickupTime']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ── Validation Schemas ───────────────────────────────────

/**
 * Schema for creating a food reservation claim.
 */
export const createReservationSchema = z.object({
  foodId: objectIdSchema,
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
});

/**
 * Schema for updating a reservation status.
 * Allowed status transitions: accepted, rejected, cancelled, picked_up, completed.
 */
export const updateReservationStatusSchema = z.object({
  status: z.enum(
    [
      ReservationStatus.ACCEPTED,
      ReservationStatus.REJECTED,
      ReservationStatus.CANCELLED,
      ReservationStatus.PICKED_UP,
      ReservationStatus.COMPLETED,
    ],
    {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be one of: accepted, rejected, cancelled, picked_up, completed',
    },
  ),
});

/**
 * Schema for querying/filtering reservation lists.
 */
export const reservationQuerySchema = paginationSchema
  .merge(sortSchema)
  .extend({
    status: z.nativeEnum(ReservationStatus).optional(),
    claimerRole: z.nativeEnum(ClaimerRole).optional(),
  });

/**
 * Schema for cancelling a reservation with an optional reason.
 */
export const cancelReservationSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(300, 'Reason cannot exceed 300 characters')
    .optional(),
});

// ── Inferred DTO Types ────────────────────────────────────

export type CreateReservationDto = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusDto = z.infer<typeof updateReservationStatusSchema>;
export type ReservationQueryDto = z.infer<typeof reservationQuerySchema>;
export type CancelReservationDto = z.infer<typeof cancelReservationSchema>;
