import { Types } from 'mongoose';
import Food, {
  IFoodDocument,
  FoodStatus,
  FoodCategory,
  ILocation,
} from '../models/food.model';

// ── Input & Filter Interfaces ─────────────────────────────

export interface CreateFoodData {
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  quantityUnit: string;
  images?: string[];
  preparedAt: Date;
  expiresAt: Date;
  isVegetarian?: boolean;
  isVegan?: boolean;
  containsAllergens?: boolean;
  allergens?: string[];
  donor: string | Types.ObjectId;
  location: ILocation;
  pickupStartTime: Date;
  pickupEndTime: Date;
  status?: FoodStatus;
}

export type UpdateFoodData = Partial<Omit<CreateFoodData, 'donor'>>;

export interface FoodFilters {
  status?: FoodStatus;
  category?: FoodCategory;
  city?: string;
  donor?: string;
  vegetarian?: boolean;
  vegan?: boolean;
  expiresAfter?: Date;
  expiresBefore?: Date;
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

export class FoodRepository {
  /**
   * Create a new food listing.
   */
  async create(data: CreateFoodData): Promise<IFoodDocument> {
    const food = await Food.create(data);
    return food;
  }

  /**
   * Find a food listing by ID. Returns null if not found.
   */
  async findById(id: string): Promise<IFoodDocument | null> {
    return Food.findById(id).lean<IFoodDocument>();
  }

  /**
   * Find a food listing by ID and populate donor details (name, email, role).
   */
  async findByIdWithDonor(id: string): Promise<IFoodDocument | null> {
    return Food.findById(id)
      .populate('donor', 'name email role accountStatus')
      .lean<IFoodDocument>();
  }

  /**
   * Find a food listing by ID only if it is AVAILABLE and not expired.
   */
  async findAvailableById(id: string): Promise<IFoodDocument | null> {
    return Food.findOne({
      _id: id,
      status: FoodStatus.AVAILABLE,
      expiresAt: { $gt: new Date() },
    }).lean<IFoodDocument>();
  }

  /**
   * Find all food listings matching optional filters and pagination.
   */
  async findAll(
    filters: FoodFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<IFoodDocument>> {
    const query: Record<string, unknown> = {};

    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.city) query['location.city'] = new RegExp(`^${filters.city}$`, 'i');
    if (filters.donor) query.donor = filters.donor;
    if (filters.vegetarian !== undefined) query.isVegetarian = filters.vegetarian;
    if (filters.vegan !== undefined) query.isVegan = filters.vegan;

    if (filters.expiresAfter || filters.expiresBefore) {
      const expiresAtQuery: Record<string, unknown> = {};
      if (filters.expiresAfter) expiresAtQuery.$gte = filters.expiresAfter;
      if (filters.expiresBefore) expiresAtQuery.$lte = filters.expiresBefore;
      query.expiresAt = expiresAtQuery;
    }

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, pagination.limit || 10);
    const skip = (page - 1) * limit;

    const sortBy = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      Food.find(query).sort(sort).skip(skip).limit(limit).lean<IFoodDocument[]>(),
      Food.countDocuments(query),
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
   * Find available, non-expired food listings near a latitude/longitude point within a given radius in kilometers.
   * Utilizes MongoDB $near operator over the 2dsphere index on location.coordinates.
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<IFoodDocument>> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, pagination.limit || 10);
    const skip = (page - 1) * limit;

    const maxDistanceInMeters = radiusKm * 1000;

    const query = {
      status: FoodStatus.AVAILABLE,
      expiresAt: { $gt: new Date() },
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistanceInMeters,
        },
      },
    };

    const [data, total] = await Promise.all([
      Food.find(query).skip(skip).limit(limit).lean<IFoodDocument[]>(),
      Food.countDocuments(query),
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
   * Find food listings published by a specific donor.
   */
  async findByDonor(
    donorId: string,
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<IFoodDocument>> {
    return this.findAll({ donor: donorId }, pagination);
  }

  /**
   * Update a food listing document.
   */
  async update(id: string, data: UpdateFoodData): Promise<IFoodDocument | null> {
    return Food.findByIdAndUpdate(id, { $set: data }, { new: true }).lean<IFoodDocument>();
  }

  /**
   * Update the status of a food listing.
   */
  async updateStatus(id: string, status: FoodStatus): Promise<IFoodDocument | null> {
    return Food.findByIdAndUpdate(id, { status }, { new: true }).lean<IFoodDocument>();
  }

  /**
   * Delete a food listing by ID. Returns true if deleted, false if not found.
   */
  async delete(id: string): Promise<boolean> {
    const result = await Food.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Count food listings by status.
   */
  async countByStatus(status: FoodStatus): Promise<number> {
    return Food.countDocuments({ status });
  }

  /**
   * Count food listings by donor ID.
   */
  async countByDonor(donorId: string): Promise<number> {
    return Food.countDocuments({ donor: donorId });
  }
}
