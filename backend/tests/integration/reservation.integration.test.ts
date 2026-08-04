import '../setup/mocks';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/dbSetup';
import { api, authHeader } from '../setup/testHelpers';
import { createDonor, createNgo, createFood, createReservation } from '../setup/fixtures';
import { mockRedis } from '../setup/mocks';
import { ReservationStatus } from '../../src/models/reservation.model';
import { FoodStatus } from '../../src/models/food.model';
import { UserRole } from '../../src/models/user.model';

describe('Reservation Integration Tests', () => {
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

  // ── Create Reservation ────────────────────────────────

  describe('POST /api/v1/reservations', () => {
    it('should create a food reservation claim by an NGO', async () => {
      const donor = await createDonor();
      const ngo = await createNgo();
      const food = await createFood(donor._id);

      const res = await api
        .post('/api/v1/reservations')
        .set(authHeader(ngo._id.toString(), UserRole.NGO))
        .send({
          foodId: food._id.toString(),
          notes: 'Will pick up at 4 PM',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ReservationStatus.PENDING);
    });

    it('should reject claim if food is already reserved', async () => {
      const donor = await createDonor();
      const ngo = await createNgo();
      const food = await createFood(donor._id, { status: FoodStatus.RESERVED });

      const res = await api
        .post('/api/v1/reservations')
        .set(authHeader(ngo._id.toString(), UserRole.NGO))
        .send({ foodId: food._id.toString() });

      expect(res.status).toBe(400);
    });
  });

  // ── Accept Reservation ────────────────────────────────

  describe('PATCH /api/v1/reservations/:id/accept', () => {
    it('should allow donor owner to accept pending reservation', async () => {
      const donor = await createDonor();
      const ngo = await createNgo();
      const food = await createFood(donor._id, { status: FoodStatus.RESERVED });
      const reservation = await createReservation(food._id, ngo._id);

      const res = await api
        .patch(`/api/v1/reservations/${reservation._id.toString()}/accept`)
        .set(authHeader(donor._id.toString(), UserRole.DONOR))
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ReservationStatus.ACCEPTED);
    });
  });

  // ── Reject Reservation ────────────────────────────────

  describe('PATCH /api/v1/reservations/:id/reject', () => {
    it('should allow donor owner to reject pending reservation', async () => {
      const donor = await createDonor();
      const ngo = await createNgo();
      const food = await createFood(donor._id, { status: FoodStatus.RESERVED });
      const reservation = await createReservation(food._id, ngo._id);

      const res = await api
        .patch(`/api/v1/reservations/${reservation._id.toString()}/reject`)
        .set(authHeader(donor._id.toString(), UserRole.DONOR))
        .send({ status: 'rejected' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ReservationStatus.REJECTED);
    });
  });

  // ── Cancel Reservation ────────────────────────────────

  describe('PATCH /api/v1/reservations/:id/cancel', () => {
    it('should allow claimer NGO to cancel their pending reservation', async () => {
      const donor = await createDonor();
      const ngo = await createNgo();
      const food = await createFood(donor._id, { status: FoodStatus.RESERVED });
      const reservation = await createReservation(food._id, ngo._id);

      const res = await api
        .patch(`/api/v1/reservations/${reservation._id.toString()}/cancel`)
        .set(authHeader(ngo._id.toString(), UserRole.NGO))
        .send({ reason: 'Plans changed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ReservationStatus.CANCELLED);
    });
  });

  // ── Pickup Reservation ────────────────────────────────

  describe('PATCH /api/v1/reservations/:id/pickup', () => {
    it('should allow donor to mark accepted reservation as picked up', async () => {
      const donor = await createDonor();
      const ngo = await createNgo();
      const food = await createFood(donor._id, { status: FoodStatus.RESERVED });
      const reservation = await createReservation(food._id, ngo._id, {
        status: ReservationStatus.ACCEPTED,
      });

      const res = await api
        .patch(`/api/v1/reservations/${reservation._id.toString()}/pickup`)
        .set(authHeader(donor._id.toString(), UserRole.DONOR))
        .send({ status: 'picked_up' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ReservationStatus.PICKED_UP);
    });
  });

  // ── Complete Reservation ──────────────────────────────

  describe('PATCH /api/v1/reservations/:id/complete', () => {
    it('should allow donor to complete a picked up reservation', async () => {
      const donor = await createDonor();
      const ngo = await createNgo();
      const food = await createFood(donor._id, { status: FoodStatus.PICKED_UP });
      const reservation = await createReservation(food._id, ngo._id, {
        status: ReservationStatus.PICKED_UP,
      });

      const res = await api
        .patch(`/api/v1/reservations/${reservation._id.toString()}/complete`)
        .set(authHeader(donor._id.toString(), UserRole.DONOR))
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ReservationStatus.COMPLETED);
    });
  });
});
