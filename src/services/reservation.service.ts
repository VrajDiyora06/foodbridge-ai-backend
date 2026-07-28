import { StatusCodes } from 'http-status-codes';
import Reservation, {
  IReservationDocument,
  ReservationStatus,
  ClaimerRole,
} from '../models/reservation.model';
import { IFoodDocument, FoodStatus } from '../models/food.model';
import { UserRole, AccountStatus } from '../models/user.model';
import {
  ReservationRepository,
  PaginatedResult,
} from '../repositories/reservation.repository';
import { FoodRepository } from '../repositories/food.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/appError';
import logger from '../utils/logger';
import { addReservationExpiryJob } from '../jobs';
import type {
  CreateReservationDto,
  ReservationQueryDto,
  CancelReservationDto,
} from '../validations/reservation.validation';

export interface ReservationStatistics {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  cancelled: number;
}

export class ReservationService {
  private readonly reservationRepo: ReservationRepository;
  private readonly foodRepo: FoodRepository;
  private readonly userRepo: UserRepository;

  constructor() {
    this.reservationRepo = new ReservationRepository();
    this.foodRepo = new FoodRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * Create a new reservation claim for a food listing.
   * Enforces rules: claimer active/verified/role check, food available & unexpired, no active reservation.
   */
  async createReservation(
    userId: string,
    dto: CreateReservationDto,
  ): Promise<IReservationDocument> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new AppError('Account is not active', StatusCodes.FORBIDDEN);
    }

    if (!user.isVerified) {
      throw new AppError(
        'Please verify your email before creating reservations',
        StatusCodes.FORBIDDEN,
      );
    }

    if (user.role !== UserRole.NGO && user.role !== UserRole.VOLUNTEER) {
      throw new AppError(
        'Only NGOs and Volunteers can create food reservations',
        StatusCodes.FORBIDDEN,
      );
    }

    const food = await this.foodRepo.findById(dto.foodId);
    if (!food) {
      throw new AppError('Food listing not found', StatusCodes.NOT_FOUND);
    }

    if (food.status !== FoodStatus.AVAILABLE) {
      throw new AppError(
        'Food listing is not available for reservation',
        StatusCodes.BAD_REQUEST,
      );
    }

    if (new Date() > food.expiresAt) {
      throw new AppError('Food listing has expired', StatusCodes.BAD_REQUEST);
    }

    const activeReservation = await this.reservationRepo.findActiveByFood(dto.foodId);
    if (activeReservation) {
      throw new AppError(
        'Food listing already has an active reservation',
        StatusCodes.BAD_REQUEST,
      );
    }

    const claimerRole =
      user.role === UserRole.NGO ? ClaimerRole.NGO : ClaimerRole.VOLUNTEER;

    const reservation = await this.reservationRepo.create({
      food: dto.foodId,
      claimer: userId,
      claimerRole,
      notes: dto.notes,
      status: ReservationStatus.PENDING,
    });

    await this.foodRepo.updateStatus(dto.foodId, FoodStatus.RESERVED);

    try {
      const delay = Math.max(0, new Date(food.expiresAt).getTime() - Date.now());
      await addReservationExpiryJob(
        { reservationId: reservation._id.toString() },
        { delay, jobId: `reservation-expiry-${reservation._id}` },
      );
    } catch (err) {
      logger.error('Failed to enqueue reservation expiry job', {
        reservationId: reservation._id,
        error: (err as Error).message,
      });
    }

    return reservation;
  }

  /**
   * Get a reservation by ID with populated food and claimer relations.
   */
  async getReservationById(id: string): Promise<IReservationDocument> {
    const reservation = await this.reservationRepo.findByIdWithRelations(id);
    if (!reservation) {
      throw new AppError('Reservation not found', StatusCodes.NOT_FOUND);
    }
    return reservation;
  }

  /**
   * Get paginated reservations claimed by the specified user.
   */
  async getMyReservations(
    userId: string,
    query: ReservationQueryDto,
  ): Promise<PaginatedResult<IReservationDocument>> {
    return this.reservationRepo.findByClaimer(
      userId,
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      {
        status: query.status,
        claimerRole: query.claimerRole,
      },
    );
  }

  /**
   * Accept a pending reservation (donor owner only).
   */
  async acceptReservation(
    reservationId: string,
    donorId: string,
  ): Promise<IReservationDocument> {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found', StatusCodes.NOT_FOUND);
    }

    const food = await this.foodRepo.findById(reservation.food.toString());
    if (!food) {
      throw new AppError('Associated food listing not found', StatusCodes.NOT_FOUND);
    }

    this.verifyFoodOwnership(food, donorId);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new AppError(
        'Only pending reservations can be accepted',
        StatusCodes.BAD_REQUEST,
      );
    }

    const updatedReservation = await this.reservationRepo.updateStatus(
      reservationId,
      ReservationStatus.ACCEPTED,
    );
    if (!updatedReservation) {
      throw new AppError(
        'Failed to accept reservation',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    await this.foodRepo.updateStatus(food._id.toString(), FoodStatus.RESERVED);

    return updatedReservation;
  }

  /**
   * Reject a pending reservation (donor owner only).
   * Food listing returns to AVAILABLE status.
   */
  async rejectReservation(
    reservationId: string,
    donorId: string,
  ): Promise<IReservationDocument> {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found', StatusCodes.NOT_FOUND);
    }

    const food = await this.foodRepo.findById(reservation.food.toString());
    if (!food) {
      throw new AppError('Associated food listing not found', StatusCodes.NOT_FOUND);
    }

    this.verifyFoodOwnership(food, donorId);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new AppError(
        'Only pending reservations can be rejected',
        StatusCodes.BAD_REQUEST,
      );
    }

    const updatedReservation = await this.reservationRepo.updateStatus(
      reservationId,
      ReservationStatus.REJECTED,
    );
    if (!updatedReservation) {
      throw new AppError(
        'Failed to reject reservation',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    await this.foodRepo.updateStatus(food._id.toString(), FoodStatus.AVAILABLE);

    return updatedReservation;
  }

  /**
   * Cancel a pending or accepted reservation (claimer owner only).
   * Food listing returns to AVAILABLE status.
   */
  async cancelReservation(
    reservationId: string,
    userId: string,
    dto?: CancelReservationDto,
  ): Promise<IReservationDocument> {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found', StatusCodes.NOT_FOUND);
    }

    this.verifyClaimerOwnership(reservation, userId);

    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.ACCEPTED
    ) {
      throw new AppError(
        'Only pending or accepted reservations can be cancelled',
        StatusCodes.BAD_REQUEST,
      );
    }

    const notes = dto?.reason
      ? `Cancelled: ${dto.reason}`
      : reservation.notes;

    const updatedReservation = await this.reservationRepo.update(reservationId, {
      status: ReservationStatus.CANCELLED,
      notes,
    });

    if (!updatedReservation) {
      throw new AppError(
        'Failed to cancel reservation',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    await this.foodRepo.updateStatus(
      reservation.food.toString(),
      FoodStatus.AVAILABLE,
    );

    return updatedReservation;
  }

  /**
   * Mark an accepted reservation as picked up (donor owner only).
   */
  async markPickedUp(
    reservationId: string,
    donorId: string,
  ): Promise<IReservationDocument> {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found', StatusCodes.NOT_FOUND);
    }

    const food = await this.foodRepo.findById(reservation.food.toString());
    if (!food) {
      throw new AppError('Associated food listing not found', StatusCodes.NOT_FOUND);
    }

    this.verifyFoodOwnership(food, donorId);

    if (reservation.status !== ReservationStatus.ACCEPTED) {
      throw new AppError(
        'Reservation must be accepted before marking as picked up',
        StatusCodes.BAD_REQUEST,
      );
    }

    const updatedReservation = await this.reservationRepo.update(reservationId, {
      status: ReservationStatus.PICKED_UP,
      pickupTime: new Date(),
    });

    if (!updatedReservation) {
      throw new AppError(
        'Failed to update reservation to picked up',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    await this.foodRepo.updateStatus(food._id.toString(), FoodStatus.PICKED_UP);

    return updatedReservation;
  }

  /**
   * Complete a picked up reservation (donor owner only).
   * Food status updates to DELIVERED.
   */
  async completeReservation(
    reservationId: string,
    donorId: string,
  ): Promise<IReservationDocument> {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found', StatusCodes.NOT_FOUND);
    }

    const food = await this.foodRepo.findById(reservation.food.toString());
    if (!food) {
      throw new AppError('Associated food listing not found', StatusCodes.NOT_FOUND);
    }

    this.verifyFoodOwnership(food, donorId);

    if (reservation.status !== ReservationStatus.PICKED_UP) {
      throw new AppError(
        'Reservation must be picked up before completing',
        StatusCodes.BAD_REQUEST,
      );
    }

    const updatedReservation = await this.reservationRepo.updateStatus(
      reservationId,
      ReservationStatus.COMPLETED,
    );

    if (!updatedReservation) {
      throw new AppError(
        'Failed to complete reservation',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    await this.foodRepo.updateStatus(food._id.toString(), FoodStatus.DELIVERED);

    return updatedReservation;
  }

  /**
   * Retrieve aggregate statistics for reservations claimed by the specified user.
   * Runs queries concurrently using Promise.all.
   */
  async getReservationStatistics(userId: string): Promise<ReservationStatistics> {
    const [total, pending, accepted, completed, cancelled] = await Promise.all([
      Reservation.countDocuments({ claimer: userId }),
      Reservation.countDocuments({ claimer: userId, status: ReservationStatus.PENDING }),
      Reservation.countDocuments({ claimer: userId, status: ReservationStatus.ACCEPTED }),
      Reservation.countDocuments({ claimer: userId, status: ReservationStatus.COMPLETED }),
      Reservation.countDocuments({ claimer: userId, status: ReservationStatus.CANCELLED }),
    ]);

    return { total, pending, accepted, completed, cancelled };
  }

  // ─── Private Helpers ─────────────────────────────────────

  /**
   * Verify that the food listing belongs to the specified donor.
   */
  private verifyFoodOwnership(food: IFoodDocument, donorId: string): void {
    const donorObj = food.donor as unknown;
    const ownerId =
      typeof donorObj === 'object' && donorObj !== null && '_id' in donorObj
        ? String((donorObj as { _id: unknown })._id)
        : String(food.donor);

    if (ownerId !== donorId) {
      throw new AppError(
        'You do not have permission to manage reservations for this food listing',
        StatusCodes.FORBIDDEN,
      );
    }
  }

  /**
   * Verify that the reservation belongs to the specified claimer user.
   */
  private verifyClaimerOwnership(
    reservation: IReservationDocument,
    userId: string,
  ): void {
    const claimerObj = reservation.claimer as unknown;
    const claimerId =
      typeof claimerObj === 'object' && claimerObj !== null && '_id' in claimerObj
        ? String((claimerObj as { _id: unknown })._id)
        : String(reservation.claimer);

    if (claimerId !== userId) {
      throw new AppError(
        'You do not have permission to manage this reservation',
        StatusCodes.FORBIDDEN,
      );
    }
  }
}

export const reservationService = new ReservationService();
