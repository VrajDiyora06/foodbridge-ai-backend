import { Types } from 'mongoose';
import { UserRole, AccountStatus } from '../../src/models/user.model';
import { FoodStatus, FoodCategory } from '../../src/models/food.model';
import { ReservationStatus, ClaimerRole } from '../../src/models/reservation.model';

// ── ID generators ─────────────────────────────────────────

export const objectId = () => new Types.ObjectId().toString();

// ── User fixtures ─────────────────────────────────────────

export const createMockUser = (overrides: Record<string, unknown> = {}) => ({
  _id: objectId(),
  name: 'Test User',
  email: 'test@example.com',
  password: '$2a$10$hashedpassword',
  role: UserRole.DONOR,
  accountStatus: AccountStatus.ACTIVE,
  isVerified: true,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  toObject: function () { return { ...this }; },
  toString: function () { return this._id; },
  ...overrides,
});

export const createMockNgo = (overrides: Record<string, unknown> = {}) =>
  createMockUser({
    name: 'Test NGO',
    email: 'ngo@example.com',
    role: UserRole.NGO,
    organizationName: 'Test Org',
    ...overrides,
  });

export const createMockAdmin = (overrides: Record<string, unknown> = {}) =>
  createMockUser({
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    ...overrides,
  });

// ── Food fixtures ─────────────────────────────────────────

export const createMockFood = (overrides: Record<string, unknown> = {}) => ({
  _id: objectId(),
  title: 'Fresh Rice Packages',
  description: 'Cooked meals for distribution',
  category: FoodCategory.COOKED,
  quantity: 25,
  quantityUnit: 'servings',
  donor: objectId(),
  status: FoodStatus.AVAILABLE,
  location: {
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'USA',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
  },
  preparedAt: new Date(Date.now() - 3600000),
  expiresAt: new Date(Date.now() + 86400000),
  pickupStartTime: new Date(),
  pickupEndTime: new Date(Date.now() + 18000000),
  createdAt: new Date(),
  updatedAt: new Date(),
  toObject: function () { return { ...this }; },
  toString: function () { return this._id; },
  ...overrides,
});

// ── Reservation fixtures ──────────────────────────────────

export const createMockReservation = (overrides: Record<string, unknown> = {}) => ({
  _id: objectId(),
  food: objectId(),
  claimer: objectId(),
  claimerRole: ClaimerRole.NGO,
  status: ReservationStatus.PENDING,
  notes: 'Will pick up by evening',
  createdAt: new Date(),
  updatedAt: new Date(),
  toObject: function () { return { ...this }; },
  toString: function () { return this._id; },
  ...overrides,
});

// ── Notification fixtures ─────────────────────────────────

export const createMockNotification = (overrides: Record<string, unknown> = {}) => ({
  _id: objectId(),
  recipient: objectId(),
  title: 'New Reservation',
  message: 'Someone reserved your food listing.',
  type: 'reservation',
  isRead: false,
  priority: 'normal',
  createdAt: new Date(),
  updatedAt: new Date(),
  toObject: function () { return { ...this }; },
  toString: function () { return this._id; },
  ...overrides,
});
