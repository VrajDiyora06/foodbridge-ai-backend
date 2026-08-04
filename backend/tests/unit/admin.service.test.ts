import { AdminService } from '../../src/services/admin.service';
import { FoodRepository } from '../../src/repositories/food.repository';
import { ReservationRepository } from '../../src/repositories/reservation.repository';

// Mock Mongoose models used directly by AdminService
jest.mock('../../src/models/user.model', () => {
  const actual = jest.requireActual('../../src/models/user.model');
  const MockUser: any = jest.fn();
  MockUser.countDocuments = jest.fn().mockResolvedValue(0);
  MockUser.aggregate = jest.fn().mockResolvedValue([]);
  // re-export enums
  return { ...actual, default: MockUser, __esModule: true };
});

jest.mock('../../src/models/food.model', () => {
  const actual = jest.requireActual('../../src/models/food.model');
  const MockFood: any = jest.fn();
  MockFood.countDocuments = jest.fn().mockResolvedValue(0);
  MockFood.aggregate = jest.fn().mockResolvedValue([]);
  return { ...actual, default: MockFood, __esModule: true };
});

jest.mock('../../src/models/reservation.model', () => {
  const actual = jest.requireActual('../../src/models/reservation.model');
  const MockReservation: any = jest.fn();
  MockReservation.countDocuments = jest.fn().mockResolvedValue(0);
  MockReservation.aggregate = jest.fn().mockResolvedValue([]);
  return { ...actual, default: MockReservation, __esModule: true };
});

jest.mock('../../src/repositories/food.repository');
jest.mock('../../src/repositories/reservation.repository');

// Import after mocking
import User from '../../src/models/user.model';
import Food from '../../src/models/food.model';
import Reservation from '../../src/models/reservation.model';

describe('AdminService', () => {
  let service: AdminService;
  let mockFoodRepo: jest.Mocked<FoodRepository>;
  let mockResRepo: jest.Mocked<ReservationRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminService();
    mockFoodRepo = (service as any).foodRepo;
    mockResRepo = (service as any).reservationRepo;
  });

  // ── getDashboardStats ─────────────────────────────────

  describe('getDashboardStats', () => {
    it('should aggregate user, food, and reservation counts', async () => {
      // Mock countDocuments to return values in order
      (User.countDocuments as jest.Mock)
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(40)  // donors
        .mockResolvedValueOnce(20)  // NGOs
        .mockResolvedValueOnce(15)  // volunteers
        .mockResolvedValueOnce(5);  // admins

      (Food.countDocuments as jest.Mock)
        .mockResolvedValueOnce(200) // total food
        .mockResolvedValueOnce(80)  // available
        .mockResolvedValueOnce(50)  // reserved
        .mockResolvedValueOnce(40)  // delivered
        .mockResolvedValueOnce(20)  // expired
        .mockResolvedValueOnce(10); // cancelled

      (Reservation.countDocuments as jest.Mock)
        .mockResolvedValueOnce(150) // total
        .mockResolvedValueOnce(30)  // pending
        .mockResolvedValueOnce(25)  // accepted
        .mockResolvedValueOnce(10)  // rejected
        .mockResolvedValueOnce(60)  // completed
        .mockResolvedValueOnce(15)  // cancelled
        .mockResolvedValueOnce(10); // expired

      const stats = await service.getDashboardStats();

      expect(stats.users.total).toBe(100);
      expect(stats.users.donors).toBe(40);
      expect(stats.users.ngos).toBe(20);
      expect(stats.users.volunteers).toBe(15);
      expect(stats.users.admins).toBe(5);
      expect(stats.users.regularUsers).toBe(20); // 100 - (40+20+15+5)

      expect(stats.food.total).toBe(200);
      expect(stats.food.available).toBe(80);
      expect(stats.food.expired).toBe(20);

      expect(stats.reservations.total).toBe(150);
      expect(stats.reservations.completed).toBe(60);
    });
  });

  // ── getAnalyticsStats ─────────────────────────────────

  describe('getAnalyticsStats', () => {
    it('should aggregate analytics with completion rate', async () => {
      const dailyData = [{ _id: '2026-01-01', count: 5 }];
      const monthlyData = [{ _id: '2026-01', count: 50 }];
      const categoryData = [{ _id: 'cooked', count: 30 }];
      const userData = [{ _id: '2026-01', count: 10 }];

      (Food.aggregate as jest.Mock)
        .mockResolvedValueOnce(dailyData)
        .mockResolvedValueOnce(monthlyData)
        .mockResolvedValueOnce(categoryData);

      (User.aggregate as jest.Mock).mockResolvedValueOnce(userData);

      (Reservation.countDocuments as jest.Mock)
        .mockResolvedValueOnce(100)  // total
        .mockResolvedValueOnce(75);  // completed

      const stats = await service.getAnalyticsStats();

      expect(stats.donationsOverTime.daily).toEqual(dailyData);
      expect(stats.donationsOverTime.monthly).toEqual(monthlyData);
      expect(stats.categoryDistribution).toEqual(categoryData);
      expect(stats.userGrowth).toEqual(userData);
      expect(stats.completionRatePercentage).toBe(75);
    });

    it('should return 0% completion rate when no reservations exist', async () => {
      (Food.aggregate as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (User.aggregate as jest.Mock).mockResolvedValueOnce([]);

      (Reservation.countDocuments as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const stats = await service.getAnalyticsStats();
      expect(stats.completionRatePercentage).toBe(0);
    });
  });

  // ── getAllFood ─────────────────────────────────────────

  describe('getAllFood', () => {
    it('should delegate to food repository', async () => {
      const paginatedResult = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockFoodRepo.findAll = jest.fn().mockResolvedValue(paginatedResult);

      const result = await service.getAllFood({ status: 'available' as any });
      expect(result).toEqual(paginatedResult);
      expect(mockFoodRepo.findAll).toHaveBeenCalled();
    });
  });

  // ── getAllReservations ─────────────────────────────────

  describe('getAllReservations', () => {
    it('should delegate to reservation repository', async () => {
      const paginatedResult = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockResRepo.findAll = jest.fn().mockResolvedValue(paginatedResult);

      const result = await service.getAllReservations({});
      expect(result).toEqual(paginatedResult);
      expect(mockResRepo.findAll).toHaveBeenCalled();
    });
  });
});
