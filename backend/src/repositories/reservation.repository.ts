import { Types } from 'mongoose';
import Reservation, {
  IReservationDocument,
  ReservationStatus,
  ClaimerRole,
} from '../models/reservation.model';

// ── Input & Filter Interfaces ─────────────────────────────

export interface CreateReservationData {
  food: string | Types.ObjectId;
  claimer: string | Types.ObjectId;
  claimerRole: ClaimerRole;
  status?: ReservationStatus;
  pickupTime?: Date;
  notes?: string;
}

export type UpdateReservationData = Partial<Omit<CreateReservationData, 'food' | 'claimer'>>;

export interface ReservationFilters {
  status?: ReservationStatus;
  food?: string;
  claimer?: string;
  claimerRole?: ClaimerRole;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Repository ───────────────────────────────────────────

export class ReservationRepository {
  /**
   * Create a new reservation claim.
   */
  async create(data: CreateReservationData): Promise<IReservationDocument> {
    const reservation = await Reservation.create(data);
    return reservation;
  }

  /**
   * Find a reservation by ID. Returns null if not found.
   */
  async findById(id: string): Promise<IReservationDocument | null> {
    return Reservation.findById(id).lean<IReservationDocument>();
  }

  /**
   * Find a reservation by ID with populated food and claimer details.
   */
  async findByIdWithRelations(id: string): Promise<IReservationDocument | null> {
    return Reservation.findById(id)
      .populate('food')
      .populate('claimer', 'name email role accountStatus')
      .lean<IReservationDocument>();
  }

  /**
   * Find active reservation for a food listing (pending, accepted, or picked_up).
   * Ensures only one active reservation exists per food item.
   */
  async findActiveByFood(foodId: string): Promise<IReservationDocument | null> {
    return Reservation.findOne({
      food: foodId,
      status: {
        $in: [
          ReservationStatus.PENDING,
          ReservationStatus.ACCEPTED,
          ReservationStatus.PICKED_UP,
        ],
      },
    }).lean<IReservationDocument>();
  }

  /**
   * Find all reservations by claimer ID with pagination and populated food details.
   */
  async findByClaimer(
    claimerId: string,
    pagination: PaginationOptions = {},
    filters: ReservationFilters = {},
  ): Promise<PaginatedResult<IReservationDocument>> {
    const query: Record<string, unknown> = { claimer: claimerId };

    if (filters.status) query.status = filters.status;
    if (filters.food) query.food = filters.food;

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, pagination.limit || 10);
    const skip = (page - 1) * limit;

    const sortBy = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      Reservation.find(query)
        .populate('food')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<IReservationDocument[]>(),
      Reservation.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all reservations for a specific food listing with populated claimer details.
   */
  async findByFood(foodId: string): Promise<IReservationDocument[]> {
    return Reservation.find({ food: foodId })
      .populate('claimer', 'name email role accountStatus')
      .sort({ createdAt: -1 })
      .lean<IReservationDocument[]>();
  }

  /**
   * Find all system reservations with filtering, pagination, and populated details (Admin).
   */
  async findAll(
    filters: ReservationFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<IReservationDocument>> {
    const query: Record<string, unknown> = {};

    if (filters.status) query.status = filters.status;
    if (filters.food) query.food = filters.food;
    if (filters.claimer) query.claimer = filters.claimer;
    if (filters.claimerRole) query.claimerRole = filters.claimerRole;

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, pagination.limit || 10);
    const skip = (page - 1) * limit;

    const sortBy = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      Reservation.find(query)
        .populate('food')
        .populate('claimer', 'name email role accountStatus phone organizationName')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<IReservationDocument[]>(),
      Reservation.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Update reservation fields.
   */
  async update(
    id: string,
    data: UpdateReservationData,
  ): Promise<IReservationDocument | null> {
    return Reservation.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).lean<IReservationDocument>();
  }

  /**
   * Update reservation status.
   */
  async updateStatus(
    id: string,
    status: ReservationStatus,
  ): Promise<IReservationDocument | null> {
    return Reservation.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true },
    ).lean<IReservationDocument>();
  }

  /**
   * Delete a reservation by ID. Returns true if deleted.
   */
  async delete(id: string): Promise<boolean> {
    const result = await Reservation.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Count total reservations matching a given status.
   */
  async countByStatus(status: ReservationStatus): Promise<number> {
    return Reservation.countDocuments({ status });
  }

  /**
   * Count total reservations created by a specific claimer.
   */
  async countByClaimer(claimerId: string): Promise<number> {
    return Reservation.countDocuments({ claimer: claimerId });
  }

  /**
   * Count total reservations for a specific food listing.
   */
  async countByFood(foodId: string): Promise<number> {
    return Reservation.countDocuments({ food: foodId });
  }
}

export const reservationRepository = new ReservationRepository();
