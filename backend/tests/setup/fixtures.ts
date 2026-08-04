import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User, { UserRole, AccountStatus, IUserDocument } from '../../src/models/user.model';
import Food, { FoodCategory, FoodStatus, IFoodDocument } from '../../src/models/food.model';
import Reservation, { ReservationStatus, ClaimerRole, IReservationDocument } from '../../src/models/reservation.model';
import { env } from '../../src/config';

export const TEST_PASSWORD = 'SecurePassword123!';

/**
 * Creates and saves a User document with a pre-hashed password.
 */
export const createUserFixture = async (overrides: Record<string, any> = {}): Promise<IUserDocument> => {
  const hashedPassword = await bcrypt.hash(overrides.password || TEST_PASSWORD, 10);
  const user = new User({
    name: 'Test User',
    email: `user_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
    password: hashedPassword,
    role: UserRole.USER,
    accountStatus: AccountStatus.ACTIVE,
    isVerified: true,
    ...overrides,
  });
  return user.save();
};

export const createAdmin = async (overrides: Record<string, any> = {}): Promise<IUserDocument> => {
  return createUserFixture({
    name: 'Admin User',
    email: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
    role: UserRole.ADMIN,
    ...overrides,
  });
};

export const createDonor = async (overrides: Record<string, any> = {}): Promise<IUserDocument> => {
  return createUserFixture({
    name: 'Donor User',
    email: `donor_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
    role: UserRole.DONOR,
    organizationName: 'Food Donor Co',
    ...overrides,
  });
};

export const createNgo = async (overrides: Record<string, any> = {}): Promise<IUserDocument> => {
  return createUserFixture({
    name: 'NGO User',
    email: `ngo_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
    role: UserRole.NGO,
    organizationName: 'Helping Hands NGO',
    ...overrides,
  });
};

export const createVolunteer = async (overrides: Record<string, any> = {}): Promise<IUserDocument> => {
  return createUserFixture({
    name: 'Volunteer User',
    email: `volunteer_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
    role: UserRole.VOLUNTEER,
    ...overrides,
  });
};

/**
 * Creates and saves a Food document in the database.
 */
export const createFood = async (donorId: string | Types.ObjectId, overrides: Record<string, any> = {}): Promise<IFoodDocument> => {
  const food = new Food({
    title: 'Fresh Rice & Curry Packages',
    description: 'Hot cooked meals prepared daily',
    category: FoodCategory.COOKED,
    quantity: 20,
    quantityUnit: 'servings',
    donor: donorId,
    status: FoodStatus.AVAILABLE,
    location: {
      address: '100 Market St',
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
    ...overrides,
  });
  return food.save();
};

/**
 * Creates and saves a Reservation document in the database.
 */
export const createReservation = async (
  foodId: string | Types.ObjectId,
  claimerId: string | Types.ObjectId,
  overrides: Record<string, any> = {},
): Promise<IReservationDocument> => {
  const reservation = new Reservation({
    food: foodId,
    claimer: claimerId,
    claimerRole: ClaimerRole.NGO,
    status: ReservationStatus.PENDING,
    notes: 'Will pick up in 2 hours',
    ...overrides,
  });
  return reservation.save();
};

/**
 * Generates a valid JWT Access Token for test requests.
 */
export const generateAccessToken = (userId: string, role: string = UserRole.USER): string => {
  return jwt.sign({ userId, role, jti: new Types.ObjectId().toString() }, env.jwtSecret, {
    expiresIn: '15m',
  });
};

/**
 * Generates a valid JWT Refresh Token for test requests.
 */
export const generateRefreshToken = (userId: string): { token: string; tokenId: string } => {
  const tokenId = new Types.ObjectId().toString();
  const token = jwt.sign({ userId, tokenId }, env.jwtRefreshSecret, {
    expiresIn: '7d',
  });
  return { token, tokenId };
};
