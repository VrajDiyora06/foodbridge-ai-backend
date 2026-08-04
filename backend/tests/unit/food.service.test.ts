import { FoodService } from '../../src/services/food.service';
import { FoodRepository } from '../../src/repositories/food.repository';
import { UserRepository } from '../../src/repositories/user.repository';
import { FoodStatus } from '../../src/models/food.model';
import { AccountStatus } from '../../src/models/user.model';
import { AppError } from '../../src/utils/appError';
import { createMockUser, createMockFood, objectId } from '../helpers/testData';

// Mock all external dependencies
jest.mock('../../src/repositories/food.repository');
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/jobs', () => ({
  addFoodExpiryJob: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/socket/events/food.events', () => ({
  emitFoodCreated: jest.fn(),
  emitFoodUpdated: jest.fn(),
  emitFoodDeleted: jest.fn(),
  emitFoodExpired: jest.fn(),
}));
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('FoodService', () => {
  let foodService: FoodService;
  let mockFoodRepo: jest.Mocked<FoodRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    foodService = new FoodService();
    mockFoodRepo = (foodService as any).foodRepo;
    mockUserRepo = (foodService as any).userRepo;
  });

  // ── createFood ────────────────────────────────────────

  describe('createFood', () => {
    const dto = {
      title: 'Meals',
      description: 'Cooked meals',
      category: 'cooked' as any,
      quantity: 10,
      quantityUnit: 'servings',
      location: {
        address: '1 Main',
        city: 'SF',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
        coordinates: { latitude: 37.77, longitude: -122.41 },
      },
      preparedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      pickupStartTime: new Date().toISOString(),
      pickupEndTime: new Date(Date.now() + 18000000).toISOString(),
    };

    it('should create food when donor is active and verified', async () => {
      const donorId = objectId();
      const donor = createMockUser({ _id: donorId });
      const food = createMockFood({ donor: donorId });

      mockUserRepo.findById = jest.fn().mockResolvedValue(donor);
      mockFoodRepo.create = jest.fn().mockResolvedValue(food);

      const result = await foodService.createFood(donorId, dto as any);

      expect(mockFoodRepo.create).toHaveBeenCalled();
      expect(result).toEqual(food);
    });

    it('should throw 404 if donor user not found', async () => {
      mockUserRepo.findById = jest.fn().mockResolvedValue(null);

      await expect(foodService.createFood('missing-id', dto as any)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw 403 if donor account is inactive', async () => {
      const donor = createMockUser({ accountStatus: AccountStatus.SUSPENDED });
      mockUserRepo.findById = jest.fn().mockResolvedValue(donor);

      await expect(foodService.createFood(donor._id, dto as any)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('should throw 403 if donor email is not verified', async () => {
      const donor = createMockUser({ isVerified: false });
      mockUserRepo.findById = jest.fn().mockResolvedValue(donor);

      await expect(foodService.createFood(donor._id, dto as any)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  // ── getFoodById ───────────────────────────────────────

  describe('getFoodById', () => {
    it('should return food when found', async () => {
      const food = createMockFood();
      mockFoodRepo.findByIdWithDonor = jest.fn().mockResolvedValue(food);

      const result = await foodService.getFoodById(food._id);
      expect(result).toEqual(food);
    });

    it('should throw 404 when food not found', async () => {
      mockFoodRepo.findByIdWithDonor = jest.fn().mockResolvedValue(null);

      await expect(foodService.getFoodById('missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── updateFood ────────────────────────────────────────

  describe('updateFood', () => {
    it('should update food when owner requests it', async () => {
      const donorId = objectId();
      const food = createMockFood({ donor: donorId, status: FoodStatus.AVAILABLE });
      const updated = { ...food, title: 'Updated' };

      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockFoodRepo.update = jest.fn().mockResolvedValue(updated);

      const result = await foodService.updateFood(food._id, donorId, { title: 'Updated' } as any);
      expect(result.title).toBe('Updated');
    });

    it('should throw 403 if requester is not the donor', async () => {
      const food = createMockFood({ donor: objectId() });
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        foodService.updateFood(food._id, 'different-user', {} as any),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw 400 if food is delivered', async () => {
      const donorId = objectId();
      const food = createMockFood({ donor: donorId, status: FoodStatus.DELIVERED });
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        foodService.updateFood(food._id, donorId, {} as any),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // ── deleteFood ────────────────────────────────────────

  describe('deleteFood', () => {
    it('should delete food when owner requests it', async () => {
      const donorId = objectId();
      const food = createMockFood({ donor: donorId, status: FoodStatus.AVAILABLE });
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockFoodRepo.delete = jest.fn().mockResolvedValue(undefined);

      await foodService.deleteFood(food._id, donorId);
      expect(mockFoodRepo.delete).toHaveBeenCalledWith(food._id);
    });

    it('should throw 400 if food is already delivered', async () => {
      const donorId = objectId();
      const food = createMockFood({ donor: donorId, status: FoodStatus.DELIVERED });
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(foodService.deleteFood(food._id, donorId)).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  // ── updateFoodStatus ──────────────────────────────────

  describe('updateFoodStatus', () => {
    it('should allow AVAILABLE → RESERVED transition', async () => {
      const donorId = objectId();
      const food = createMockFood({ donor: donorId, status: FoodStatus.AVAILABLE });
      const updated = { ...food, status: FoodStatus.RESERVED };

      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockFoodRepo.updateStatus = jest.fn().mockResolvedValue(updated);

      const result = await foodService.updateFoodStatus(food._id, donorId, FoodStatus.RESERVED);
      expect(result.status).toBe(FoodStatus.RESERVED);
    });

    it('should reject DELIVERED → AVAILABLE transition', async () => {
      const donorId = objectId();
      const food = createMockFood({ donor: donorId, status: FoodStatus.DELIVERED });
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        foodService.updateFoodStatus(food._id, donorId, FoodStatus.AVAILABLE),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should reject EXPIRED → AVAILABLE transition', async () => {
      const donorId = objectId();
      const food = createMockFood({ donor: donorId, status: FoodStatus.EXPIRED });
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        foodService.updateFoodStatus(food._id, donorId, FoodStatus.AVAILABLE),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
