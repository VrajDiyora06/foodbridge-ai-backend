import '../setup/mocks';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/dbSetup';
import { api, authHeader } from '../setup/testHelpers';
import { createDonor, createFood } from '../setup/fixtures';
import { mockRedis } from '../setup/mocks';
import { FoodCategory, FoodStatus, IFoodDocument } from '../../src/models/food.model';
import { UserRole } from '../../src/models/user.model';
import { FoodRepository } from '../../src/repositories/food.repository';

describe('Food Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    mockRedis.clear();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // ── Create Food ───────────────────────────────────────

  describe('POST /api/v1/food', () => {
    it('should create a food listing for an authorized donor', async () => {
      const donor = await createDonor();

      const payload = {
        title: 'Fresh Bread & Pastries',
        description: 'Assorted baked items',
        category: FoodCategory.BAKERY,
        quantity: 15,
        quantityUnit: 'items',
        location: {
          address: '500 Market St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA',
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        },
        preparedAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        pickupStartTime: new Date().toISOString(),
        pickupEndTime: new Date(Date.now() + 18000000).toISOString(),
      };

      const res = await api
        .post('/api/v1/food')
        .set(authHeader(donor._id.toString(), UserRole.DONOR))
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Fresh Bread & Pastries');
      expect(res.body.data.status).toBe(FoodStatus.AVAILABLE);
    });

    it('should reject food creation if user is not a donor or admin', async () => {
      const donor = await createDonor({ role: UserRole.USER });

      const payload = {
        title: 'Test Food',
        description: 'Test',
        category: FoodCategory.OTHER,
        quantity: 5,
        quantityUnit: 'boxes',
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

      const res = await api
        .post('/api/v1/food')
        .set(authHeader(donor._id.toString(), UserRole.USER))
        .send(payload);

      expect(res.status).toBe(403);
    });
  });

  // ── Update Food ───────────────────────────────────────

  describe('PATCH /api/v1/food/:id', () => {
    it('should update a food listing by its owner', async () => {
      const donor = await createDonor();
      const food = await createFood(donor._id);

      const res = await api
        .patch(`/api/v1/food/${food._id.toString()}`)
        .set(authHeader(donor._id.toString(), UserRole.DONOR))
        .send({ title: 'Updated Bread Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Bread Title');
    });

    it('should forbid non-owners from updating food listing', async () => {
      const donor1 = await createDonor();
      const donor2 = await createDonor();
      const food = await createFood(donor1._id);

      const res = await api
        .patch(`/api/v1/food/${food._id.toString()}`)
        .set(authHeader(donor2._id.toString(), UserRole.DONOR))
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
    });
  });

  // ── Delete Food ───────────────────────────────────────

  describe('DELETE /api/v1/food/:id', () => {
    it('should delete food listing by owner', async () => {
      const donor = await createDonor();
      const food = await createFood(donor._id);

      const res = await api
        .delete(`/api/v1/food/${food._id.toString()}`)
        .set(authHeader(donor._id.toString(), UserRole.DONOR));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── Nearby Search ─────────────────────────────────────

  describe('GET /api/v1/food/nearby', () => {
    it('should return nearby available food listings', async () => {
      const donor = await createDonor();
      const food = await createFood(donor._id);

      jest.spyOn(FoodRepository.prototype, 'findNearby').mockResolvedValueOnce({
        data: [food.toObject() as IFoodDocument],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const res = await api
        .get('/api/v1/food/nearby')
        .query({ latitude: 37.7749, longitude: -122.4194, radiusKm: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ── Statistics ────────────────────────────────────────

  describe('GET /api/v1/food/my/statistics', () => {
    it('should return aggregated food statistics for donor', async () => {
      const donor = await createDonor();
      await createFood(donor._id);
      await createFood(donor._id, { status: FoodStatus.DELIVERED });

      const res = await api
        .get('/api/v1/food/my/statistics')
        .set(authHeader(donor._id.toString(), UserRole.DONOR));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.available).toBe(1);
      expect(res.body.data.delivered).toBe(1);
    });
  });
});
