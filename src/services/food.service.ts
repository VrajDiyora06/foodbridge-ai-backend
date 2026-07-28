import { StatusCodes } from 'http-status-codes';
import Food, { IFoodDocument, FoodStatus } from '../models/food.model';
import { AccountStatus } from '../models/user.model';
import {
  FoodRepository,
  FoodFilters,
  PaginationOptions,
  PaginatedResult,
} from '../repositories/food.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/appError';
import logger from '../utils/logger';
import { addFoodExpiryJob } from '../jobs';
import type {
  CreateFoodDto,
  UpdateFoodDto,
  FoodQueryDto,
} from '../validations/food.validation';

export interface FoodStatistics {
  total: number;
  available: number;
  reserved: number;
  pickedUp: number;
  delivered: number;
  expired: number;
  cancelled: number;
}

export class FoodService {
  private readonly foodRepo: FoodRepository;
  private readonly userRepo: UserRepository;

  constructor() {
    this.foodRepo = new FoodRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * Create a new food donation listing.
   * Verifies that donor exists, is verified, and account is active.
   */
  async createFood(donorId: string, dto: CreateFoodDto): Promise<IFoodDocument> {
    const donor = await this.userRepo.findById(donorId);
    if (!donor) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    if (donor.accountStatus !== AccountStatus.ACTIVE) {
      throw new AppError('Account is not active', StatusCodes.FORBIDDEN);
    }

    if (!donor.isVerified) {
      throw new AppError(
        'Please verify your email before creating food listings',
        StatusCodes.FORBIDDEN,
      );
    }

    const food = await this.foodRepo.create({
      ...dto,
      donor: donorId,
    });

    try {
      const delay = Math.max(0, new Date(food.expiresAt).getTime() - Date.now());
      await addFoodExpiryJob(
        { foodId: food._id.toString() },
        { delay, jobId: `food-expiry-${food._id}` },
      );
    } catch (err) {
      logger.error('Failed to enqueue food expiry job', {
        foodId: food._id,
        error: (err as Error).message,
      });
    }

    return food;
  }

  /**
   * Get a food listing by ID with populated donor details.
   */
  async getFoodById(foodId: string): Promise<IFoodDocument> {
    const food = await this.foodRepo.findByIdWithDonor(foodId);
    if (!food) {
      throw new AppError('Food listing not found', StatusCodes.NOT_FOUND);
    }
    return food;
  }

  /**
   * Search/filter available food listings with pagination.
   * Supports proximity search if latitude and longitude are provided.
   */
  async getAvailableFood(query: FoodQueryDto): Promise<PaginatedResult<IFoodDocument>> {
    const pagination: PaginationOptions = {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    if (query.latitude !== undefined && query.longitude !== undefined) {
      return this.foodRepo.findNearby(
        query.latitude,
        query.longitude,
        query.radiusKm || 10,
        pagination,
      );
    }

    const filters: FoodFilters = {
      status: query.status || FoodStatus.AVAILABLE,
      category: query.category,
      city: query.city,
      vegetarian: query.vegetarian,
      vegan: query.vegan,
    };

    return this.foodRepo.findAll(filters, pagination);
  }

  /**
   * Get available, non-expired food listings near a geographical coordinate.
   */
  async getNearbyFood(
    latitude: number,
    longitude: number,
    radiusKm: number,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<IFoodDocument>> {
    return this.foodRepo.findNearby(latitude, longitude, radiusKm, pagination);
  }

  /**
   * Get all food listings created by a specific donor.
   */
  async getDonorFood(
    donorId: string,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<IFoodDocument>> {
    return this.foodRepo.findByDonor(donorId, pagination);
  }

  /**
   * Update an existing food listing. Only the donor who created the listing can update it.
   * Cannot update delivered or cancelled listings.
   */
  async updateFood(
    foodId: string,
    donorId: string,
    dto: UpdateFoodDto,
  ): Promise<IFoodDocument> {
    const food = await this.foodRepo.findById(foodId);
    if (!food) {
      throw new AppError('Food listing not found', StatusCodes.NOT_FOUND);
    }

    this.verifyOwnership(food, donorId);

    if (food.status === FoodStatus.DELIVERED || food.status === FoodStatus.CANCELLED) {
      throw new AppError(
        'Cannot update a food listing that is delivered or cancelled',
        StatusCodes.BAD_REQUEST,
      );
    }

    const updatedFood = await this.foodRepo.update(foodId, dto);
    if (!updatedFood) {
      throw new AppError('Failed to update food listing', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    if (dto.expiresAt) {
      try {
        const delay = Math.max(0, new Date(updatedFood.expiresAt).getTime() - Date.now());
        await addFoodExpiryJob(
          { foodId: updatedFood._id.toString() },
          { delay, jobId: `food-expiry-${updatedFood._id}` },
        );
      } catch (err) {
        logger.error('Failed to reschedule food expiry job', {
          foodId: updatedFood._id,
          error: (err as Error).message,
        });
      }
    }

    return updatedFood;
  }

  /**
   * Update the status of a food listing with strict state transition validation.
   */
  async updateFoodStatus(
    foodId: string,
    donorId: string,
    status: FoodStatus,
  ): Promise<IFoodDocument> {
    const food = await this.foodRepo.findById(foodId);
    if (!food) {
      throw new AppError('Food listing not found', StatusCodes.NOT_FOUND);
    }

    this.verifyOwnership(food, donorId);
    this.validateStatusTransition(food.status, status);

    const updatedFood = await this.foodRepo.updateStatus(foodId, status);
    if (!updatedFood) {
      throw new AppError('Failed to update food status', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return updatedFood;
  }

  /**
   * Delete a food listing. Only the donor who created the listing can delete it.
   * Cannot delete a listing that has already been delivered.
   */
  async deleteFood(foodId: string, donorId: string): Promise<void> {
    const food = await this.foodRepo.findById(foodId);
    if (!food) {
      throw new AppError('Food listing not found', StatusCodes.NOT_FOUND);
    }

    this.verifyOwnership(food, donorId);

    if (food.status === FoodStatus.DELIVERED) {
      throw new AppError(
        'Cannot delete a food listing that has already been delivered',
        StatusCodes.BAD_REQUEST,
      );
    }

    await this.foodRepo.delete(foodId);
  }

  /**
   * Retrieve aggregate statistics for food listings (overall or filtered by donor).
   * Runs queries concurrently using Promise.all.
   */
  async getFoodStatistics(donorId?: string): Promise<FoodStatistics> {
    if (donorId) {
      const [total, available, reserved, pickedUp, delivered, expired, cancelled] =
        await Promise.all([
          this.foodRepo.countByDonor(donorId),
          Food.countDocuments({ donor: donorId, status: FoodStatus.AVAILABLE }),
          Food.countDocuments({ donor: donorId, status: FoodStatus.RESERVED }),
          Food.countDocuments({ donor: donorId, status: FoodStatus.PICKED_UP }),
          Food.countDocuments({ donor: donorId, status: FoodStatus.DELIVERED }),
          Food.countDocuments({ donor: donorId, status: FoodStatus.EXPIRED }),
          Food.countDocuments({ donor: donorId, status: FoodStatus.CANCELLED }),
        ]);

      return { total, available, reserved, pickedUp, delivered, expired, cancelled };
    }

    const [total, available, reserved, pickedUp, delivered, expired, cancelled] =
      await Promise.all([
        Food.countDocuments({}),
        this.foodRepo.countByStatus(FoodStatus.AVAILABLE),
        this.foodRepo.countByStatus(FoodStatus.RESERVED),
        this.foodRepo.countByStatus(FoodStatus.PICKED_UP),
        this.foodRepo.countByStatus(FoodStatus.DELIVERED),
        this.foodRepo.countByStatus(FoodStatus.EXPIRED),
        this.foodRepo.countByStatus(FoodStatus.CANCELLED),
      ]);

    return { total, available, reserved, pickedUp, delivered, expired, cancelled };
  }

  // ─── Private Helpers ─────────────────────────────────────

  /**
   * Verify that the food listing belongs to the specified donor.
   */
  private verifyOwnership(food: IFoodDocument, donorId: string): void {
    const donorObj = food.donor as unknown;
    const ownerId =
      typeof donorObj === 'object' && donorObj !== null && '_id' in donorObj
        ? String((donorObj as { _id: unknown })._id)
        : String(food.donor);

    if (ownerId !== donorId) {
      throw new AppError(
        'You do not have permission to perform this action on this food listing',
        StatusCodes.FORBIDDEN,
      );
    }
  }

  /**
   * Validate state transition rules for food status updates.
   */
  private validateStatusTransition(currentStatus: FoodStatus, newStatus: FoodStatus): void {
    if (currentStatus === newStatus) return;

    const allowedTransitions: Record<FoodStatus, FoodStatus[]> = {
      [FoodStatus.AVAILABLE]: [
        FoodStatus.RESERVED,
        FoodStatus.PICKED_UP,
        FoodStatus.DELIVERED,
        FoodStatus.CANCELLED,
        FoodStatus.EXPIRED,
      ],
      [FoodStatus.RESERVED]: [
        FoodStatus.PICKED_UP,
        FoodStatus.DELIVERED,
        FoodStatus.CANCELLED,
      ],
      [FoodStatus.PICKED_UP]: [
        FoodStatus.DELIVERED,
        FoodStatus.CANCELLED,
      ],
      [FoodStatus.DELIVERED]: [],
      [FoodStatus.EXPIRED]: [],
      [FoodStatus.CANCELLED]: [],
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Cannot transition food status from '${currentStatus}' to '${newStatus}'`,
        StatusCodes.BAD_REQUEST,
      );
    }
  }
}

export const foodService = new FoodService();
