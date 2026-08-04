import { registerSchema, loginSchema } from '../../src/validations/auth.validation';
import { createFoodSchema } from '../../src/validations/food.validation';
import { createReservationSchema, cancelReservationSchema, reservationQuerySchema } from '../../src/validations/reservation.validation';
import { updateStatusSchema, updateRoleSchema, userQuerySchema } from '../../src/validations/user.validation';
import { broadcastNotificationSchema } from '../../src/validations/notification.validation';
import { adminFoodQuerySchema } from '../../src/validations/admin.validation';
import { FoodCategory } from '../../src/models/food.model';
import { AccountStatus, UserRole } from '../../src/models/user.model';

// ── Auth validations ────────────────────────────────────

describe('Auth Validation Schemas', () => {
  it('should validate valid user registration payload', () => {
    const validData = {
      name: 'Vraj Diyora',
      email: 'vraj@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      role: 'donor',
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject registration when passwords do not match', () => {
    const invalidData = {
      name: 'Vraj Diyora',
      email: 'vraj@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'DifferentPassword123!',
      role: 'donor',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject weak passwords (missing special char)', () => {
    const result = registerSchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
      password: 'WeakPassword1',
      confirmPassword: 'WeakPassword1',
    });
    expect(result.success).toBe(false);
  });

  it('should validate valid login payload', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'MyPassword123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject login with empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

// ── Food validations ────────────────────────────────────

describe('Food Validation Schemas', () => {
  it('should validate food creation schema', () => {
    const validFood = {
      title: 'Fresh Rice Packages',
      description: 'Cooked meals available for immediate distribution.',
      category: FoodCategory.COOKED,
      quantity: 25,
      quantityUnit: 'servings',
      location: {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      },
      preparedAt: new Date(Date.now() - 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      pickupStartTime: new Date().toISOString(),
      pickupEndTime: new Date(Date.now() + 18000000).toISOString(),
    };

    const result = createFoodSchema.safeParse(validFood);
    expect(result.success).toBe(true);
  });

  it('should reject food with missing title', () => {
    const result = createFoodSchema.safeParse({
      description: 'Test',
      category: FoodCategory.COOKED,
      quantity: 5,
    });
    expect(result.success).toBe(false);
  });
});

// ── Reservation validations ─────────────────────────────

describe('Reservation Validation Schemas', () => {
  describe('createReservationSchema', () => {
    it('should validate valid reservation', () => {
      const result = createReservationSchema.safeParse({
        foodId: '507f1f77bcf86cd799439011',
        notes: 'Will pick up at 5pm',
      });
      expect(result.success).toBe(true);
    });

    it('should require foodId', () => {
      const result = createReservationSchema.safeParse({ notes: 'No food ID' });
      expect(result.success).toBe(false);
    });
  });

  describe('cancelReservationSchema', () => {
    it('should accept reason', () => {
      const result = cancelReservationSchema.safeParse({ reason: 'Changed plans' });
      expect(result.success).toBe(true);
    });

    it('should accept empty body', () => {
      const result = cancelReservationSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('reservationQuerySchema', () => {
    it('should accept valid query params', () => {
      const result = reservationQuerySchema.safeParse({
        page: '1',
        limit: '10',
        status: 'pending',
      });
      expect(result.success).toBe(true);
    });
  });
});

// ── User validations ────────────────────────────────────

describe('User Validation Schemas', () => {
  describe('updateStatusSchema', () => {
    it('should accept valid status', () => {
      const result = updateStatusSchema.safeParse({
        body: { status: AccountStatus.ACTIVE },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateStatusSchema.safeParse({
        body: { status: 'deleted' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateRoleSchema', () => {
    it('should accept valid role', () => {
      const result = updateRoleSchema.safeParse({
        body: { role: UserRole.DONOR },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const result = updateRoleSchema.safeParse({
        body: { role: 'superadmin' },
      });
      expect(result.success).toBe(false);
    });
  });
});

// ── Notification validations ────────────────────────────

describe('Notification Validation Schemas', () => {
  describe('broadcastNotificationSchema', () => {
    it('should validate a complete broadcast payload', () => {
      const result = broadcastNotificationSchema.safeParse({
        body: {
          title: 'System Notice',
          message: 'Scheduled maintenance tonight.',
          targetRole: 'all',
          type: 'system',
          priority: 'high',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should require title and message', () => {
      const result = broadcastNotificationSchema.safeParse({ body: {} });
      expect(result.success).toBe(false);
    });
  });
});

// ── Admin validations ───────────────────────────────────

describe('Admin Validation Schemas', () => {
  describe('adminFoodQuerySchema', () => {
    it('should accept valid query with nested query object', () => {
      const result = adminFoodQuerySchema.safeParse({
        query: { page: '1', limit: '20' },
      });
      expect(result.success).toBe(true);
    });
  });
});
