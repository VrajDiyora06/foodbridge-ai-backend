import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  ReservationService,
  reservationService as defaultReservationService,
} from '../services/reservation.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';
import type { ReservationQueryDto } from '../validations/reservation.validation';

/**
 * Controller handling food reservation endpoints.
 * Delegated directly to ReservationService. All HTTP responses use ApiResponse.
 */
export class ReservationController {
  private readonly reservationService: ReservationService;

  constructor(service: ReservationService = defaultReservationService) {
    this.reservationService = service;
  }

  /**
   * POST /api/v1/reservations
   * Create a new food reservation claim (authenticated NGO or Volunteer).
   */
  createReservation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.userId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }

      const result = await this.reservationService.createReservation(
        authReq.userId,
        req.body,
      );
      ApiResponse.created(res, result, 'Reservation created successfully');
    },
  );

  /**
   * GET /api/v1/reservations/:id
   * Get details of a reservation by ID with populated food and claimer information.
   */
  getReservationById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const result = await this.reservationService.getReservationById(id);
      ApiResponse.ok(res, result, 'Reservation details fetched successfully');
    },
  );

  /**
   * GET /api/v1/reservations/my
   * Get paginated reservations claimed by the currently authenticated user.
   */
  getMyReservations = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.userId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }

      const query = req.query as unknown as ReservationQueryDto;
      const result = await this.reservationService.getMyReservations(
        authReq.userId,
        query,
      );

      ApiResponse.paginated(
        res,
        result.data,
        result.page,
        result.limit,
        result.total,
        'My reservations fetched successfully',
      );
    },
  );

  /**
   * PATCH /api/v1/reservations/:id/accept
   * Accept a pending reservation (authenticated donor owner).
   */
  acceptReservation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.userId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }

      const id = req.params.id as string;
      const result = await this.reservationService.acceptReservation(
        id,
        authReq.userId,
      );
      ApiResponse.ok(res, result, 'Reservation accepted successfully');
    },
  );

  /**
   * PATCH /api/v1/reservations/:id/reject
   * Reject a pending reservation (authenticated donor owner).
   */
  rejectReservation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.userId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }

      const id = req.params.id as string;
      const result = await this.reservationService.rejectReservation(
        id,
        authReq.userId,
      );
      ApiResponse.ok(res, result, 'Reservation rejected successfully');
    },
  );

  /**
   * PATCH /api/v1/reservations/:id/cancel
   * Cancel a pending or accepted reservation (authenticated claimer owner).
   */
  cancelReservation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.userId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }

      const id = req.params.id as string;
      const result = await this.reservationService.cancelReservation(
        id,
        authReq.userId,
        req.body,
      );
      ApiResponse.ok(res, result, 'Reservation cancelled successfully');
    },
  );

  /**
   * PATCH /api/v1/reservations/:id/pickup
   * Mark an accepted reservation as picked up (authenticated donor owner).
   */
  markPickedUp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.userId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }

      const id = req.params.id as string;
      const result = await this.reservationService.markPickedUp(
        id,
        authReq.userId,
      );
      ApiResponse.ok(res, result, 'Reservation marked as picked up');
    },
  );

  /**
   * PATCH /api/v1/reservations/:id/complete
   * Complete a picked up reservation (authenticated donor owner).
   */
  completeReservation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.userId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }

      const id = req.params.id as string;
      const result = await this.reservationService.completeReservation(
        id,
        authReq.userId,
      );
      ApiResponse.ok(res, result, 'Reservation completed successfully');
    },
  );

  /**
   * GET /api/v1/reservations/my/statistics
   * Get aggregate statistics for reservations claimed by the authenticated user.
   */
  getReservationStatistics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.userId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }

      const result = await this.reservationService.getReservationStatistics(
        authReq.userId,
      );
      ApiResponse.ok(res, result, 'Reservation statistics fetched successfully');
    },
  );
}

// Export singleton instance for route mounting
export const reservationController = new ReservationController();
