import { ReservationService } from '../../src/services/reservation.service';
import { ReservationRepository } from '../../src/repositories/reservation.repository';
import { FoodRepository } from '../../src/repositories/food.repository';
import { UserRepository } from '../../src/repositories/user.repository';
import { ReservationStatus } from '../../src/models/reservation.model';
import { FoodStatus } from '../../src/models/food.model';
import { UserRole, AccountStatus } from '../../src/models/user.model';
import { AppError } from '../../src/utils/appError';
import { createMockUser, createMockFood, createMockReservation, objectId } from '../helpers/testData';

jest.mock('../../src/repositories/reservation.repository');
jest.mock('../../src/repositories/food.repository');
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/jobs', () => ({
  addReservationExpiryJob: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/socket/events/reservation.events', () => ({
  emitReservationCreated: jest.fn(),
  emitReservationAccepted: jest.fn(),
  emitReservationRejected: jest.fn(),
  emitReservationCancelled: jest.fn(),
  emitReservationPickedUp: jest.fn(),
  emitReservationCompleted: jest.fn(),
}));
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('ReservationService', () => {
  let service: ReservationService;
  let mockResRepo: jest.Mocked<ReservationRepository>;
  let mockFoodRepo: jest.Mocked<FoodRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReservationService();
    mockResRepo = (service as any).reservationRepo;
    mockFoodRepo = (service as any).foodRepo;
    mockUserRepo = (service as any).userRepo;
  });

  // ── createReservation ─────────────────────────────────

  describe('createReservation', () => {
    it('should create reservation for verified NGO on available food', async () => {
      const userId = objectId();
      const foodId = objectId();
      const user = createMockUser({
        _id: userId,
        role: UserRole.NGO,
        isVerified: true,
        accountStatus: AccountStatus.ACTIVE,
      });
      const food = createMockFood({
        _id: foodId,
        status: FoodStatus.AVAILABLE,
        expiresAt: new Date(Date.now() + 86400000),
      });
      const reservation = createMockReservation({ food: foodId, claimer: userId });

      mockUserRepo.findById = jest.fn().mockResolvedValue(user);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockResRepo.findActiveByFood = jest.fn().mockResolvedValue(null);
      mockResRepo.create = jest.fn().mockResolvedValue(reservation);
      mockFoodRepo.updateStatus = jest.fn().mockResolvedValue(food);

      const result = await service.createReservation(userId, { foodId, notes: 'pick up soon' } as any);
      expect(result).toEqual(reservation);
      expect(mockFoodRepo.updateStatus).toHaveBeenCalledWith(foodId, FoodStatus.RESERVED);
    });

    it('should throw 403 for non-NGO/volunteer roles', async () => {
      const userId = objectId();
      const user = createMockUser({ _id: userId, role: UserRole.DONOR });
      mockUserRepo.findById = jest.fn().mockResolvedValue(user);

      await expect(
        service.createReservation(userId, { foodId: objectId() } as any),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw 400 when food is not available', async () => {
      const userId = objectId();
      const user = createMockUser({ _id: userId, role: UserRole.NGO });
      const food = createMockFood({ status: FoodStatus.RESERVED });

      mockUserRepo.findById = jest.fn().mockResolvedValue(user);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        service.createReservation(userId, { foodId: food._id } as any),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw 400 when food already has an active reservation', async () => {
      const userId = objectId();
      const foodId = objectId();
      const user = createMockUser({ _id: userId, role: UserRole.NGO });
      const food = createMockFood({
        _id: foodId,
        status: FoodStatus.AVAILABLE,
        expiresAt: new Date(Date.now() + 86400000),
      });

      mockUserRepo.findById = jest.fn().mockResolvedValue(user);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockResRepo.findActiveByFood = jest.fn().mockResolvedValue(createMockReservation());

      await expect(
        service.createReservation(userId, { foodId } as any),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw 400 when food has expired', async () => {
      const userId = objectId();
      const user = createMockUser({ _id: userId, role: UserRole.NGO });
      const food = createMockFood({
        status: FoodStatus.AVAILABLE,
        expiresAt: new Date(Date.now() - 1000),
      });

      mockUserRepo.findById = jest.fn().mockResolvedValue(user);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        service.createReservation(userId, { foodId: food._id } as any),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // ── acceptReservation ─────────────────────────────────

  describe('acceptReservation', () => {
    it('should accept a pending reservation', async () => {
      const donorId = objectId();
      const reservation = createMockReservation({ status: ReservationStatus.PENDING });
      const food = createMockFood({ donor: donorId });

      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockResRepo.updateStatus = jest.fn().mockResolvedValue({
        ...reservation,
        status: ReservationStatus.ACCEPTED,
      });
      mockFoodRepo.updateStatus = jest.fn().mockResolvedValue(food);

      const result = await service.acceptReservation(reservation._id, donorId);
      expect(result.status).toBe(ReservationStatus.ACCEPTED);
    });

    it('should throw 400 when reservation is not pending', async () => {
      const donorId = objectId();
      const reservation = createMockReservation({ status: ReservationStatus.ACCEPTED });
      const food = createMockFood({ donor: donorId });

      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        service.acceptReservation(reservation._id, donorId),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // ── rejectReservation ─────────────────────────────────

  describe('rejectReservation', () => {
    it('should reject pending reservation and revert food to available', async () => {
      const donorId = objectId();
      const foodId = objectId();
      const reservation = createMockReservation({
        food: foodId,
        status: ReservationStatus.PENDING,
      });
      const food = createMockFood({ _id: foodId, donor: donorId });

      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockResRepo.updateStatus = jest.fn().mockResolvedValue({
        ...reservation,
        status: ReservationStatus.REJECTED,
      });
      mockFoodRepo.updateStatus = jest.fn().mockResolvedValue(food);

      const result = await service.rejectReservation(reservation._id, donorId);
      expect(result.status).toBe(ReservationStatus.REJECTED);
      expect(mockFoodRepo.updateStatus).toHaveBeenCalledWith(foodId, FoodStatus.AVAILABLE);
    });
  });

  // ── cancelReservation ─────────────────────────────────

  describe('cancelReservation', () => {
    it('should allow claimer to cancel a pending reservation', async () => {
      const claimerId = objectId();
      const foodId = objectId();
      const reservation = createMockReservation({
        claimer: claimerId,
        food: foodId,
        status: ReservationStatus.PENDING,
      });

      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);
      mockResRepo.update = jest.fn().mockResolvedValue({
        ...reservation,
        status: ReservationStatus.CANCELLED,
      });
      mockFoodRepo.updateStatus = jest.fn().mockResolvedValue(createMockFood());

      const result = await service.cancelReservation(reservation._id, claimerId);
      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should throw 403 if non-claimer attempts to cancel', async () => {
      const reservation = createMockReservation({ claimer: objectId() });
      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);

      await expect(
        service.cancelReservation(reservation._id, 'different-user'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw 400 if reservation is already completed', async () => {
      const claimerId = objectId();
      const reservation = createMockReservation({
        claimer: claimerId,
        status: ReservationStatus.COMPLETED,
      });
      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);

      await expect(
        service.cancelReservation(reservation._id, claimerId),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // ── markPickedUp ──────────────────────────────────────

  describe('markPickedUp', () => {
    it('should mark accepted reservation as picked up', async () => {
      const donorId = objectId();
      const reservation = createMockReservation({ status: ReservationStatus.ACCEPTED });
      const food = createMockFood({ donor: donorId });

      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockResRepo.update = jest.fn().mockResolvedValue({
        ...reservation,
        status: ReservationStatus.PICKED_UP,
        pickupTime: new Date(),
      });
      mockFoodRepo.updateStatus = jest.fn().mockResolvedValue(food);

      const result = await service.markPickedUp(reservation._id, donorId);
      expect(result.status).toBe(ReservationStatus.PICKED_UP);
    });

    it('should throw 400 when reservation is not accepted', async () => {
      const donorId = objectId();
      const reservation = createMockReservation({ status: ReservationStatus.PENDING });
      const food = createMockFood({ donor: donorId });

      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        service.markPickedUp(reservation._id, donorId),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // ── completeReservation ───────────────────────────────

  describe('completeReservation', () => {
    it('should complete a picked-up reservation', async () => {
      const donorId = objectId();
      const reservation = createMockReservation({ status: ReservationStatus.PICKED_UP });
      const food = createMockFood({ donor: donorId });

      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);
      mockResRepo.updateStatus = jest.fn().mockResolvedValue({
        ...reservation,
        status: ReservationStatus.COMPLETED,
      });
      mockFoodRepo.updateStatus = jest.fn().mockResolvedValue(food);

      const result = await service.completeReservation(reservation._id, donorId);
      expect(result.status).toBe(ReservationStatus.COMPLETED);
      expect(mockFoodRepo.updateStatus).toHaveBeenCalledWith(food._id, FoodStatus.DELIVERED);
    });

    it('should throw 400 when reservation is not picked up', async () => {
      const donorId = objectId();
      const reservation = createMockReservation({ status: ReservationStatus.ACCEPTED });
      const food = createMockFood({ donor: donorId });

      mockResRepo.findById = jest.fn().mockResolvedValue(reservation);
      mockFoodRepo.findById = jest.fn().mockResolvedValue(food);

      await expect(
        service.completeReservation(reservation._id, donorId),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // ── getReservationById ────────────────────────────────

  describe('getReservationById', () => {
    it('should return reservation with relations', async () => {
      const res = createMockReservation();
      mockResRepo.findByIdWithRelations = jest.fn().mockResolvedValue(res);

      const result = await service.getReservationById(res._id);
      expect(result).toEqual(res);
    });

    it('should throw 404 when not found', async () => {
      mockResRepo.findByIdWithRelations = jest.fn().mockResolvedValue(null);

      await expect(service.getReservationById('missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
