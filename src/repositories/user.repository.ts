import User, {
  IUser,
  IUserDocument,
  UserRole,
  AccountStatus,
} from '../models/user.model';

// ── Input types ──────────────────────────────────────────

export interface CreateUserData {
  name: string;
  email: string;
  password: string; // already hashed by the service layer
  role?: UserRole;
}

// ── Repository ───────────────────────────────────────────

export class UserRepository {
  /**
   * Insert a new user document.
   * Expects the password to already be hashed — the repository
   * has no knowledge of bcrypt or any hashing strategy.
   */
  async create(data: CreateUserData): Promise<IUserDocument> {
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? UserRole.USER,
    });
    return user;
  }

  /**
   * Find a user by email. Returns null if not found.
   * Password is NOT included (select: false on schema).
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() }).lean<IUserDocument>();
  }

  /**
   * Find a user by ID. Returns null if not found.
   * Password is NOT included.
   */
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).lean<IUserDocument>();
  }

  /**
   * Find a user by ID with the password field included.
   * Only the auth service should call this (during login / password reset).
   */
  async findByIdWithPassword(id: string): Promise<IUserDocument | null> {
    return User.findById(id).select('+password').lean<IUserDocument>();
  }

  /**
   * Find a user by email with the password field included.
   * Used during login to verify credentials.
   */
  async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+password').lean<IUserDocument>();
  }

  /**
   * Check whether an email is already registered.
   * Uses countDocuments with limit 1 — faster than findOne
   * because it stops scanning after the first match.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase() }).limit(1);
    return count > 0;
  }

  /**
   * Replace the password hash and record when it changed.
   * The new hash is produced by the service layer.
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
      { new: true },
    ).lean<IUserDocument>();
  }

  /**
   * Flip isVerified to true. Called after the user clicks
   * the email verification link.
   */
  async markEmailVerified(userId: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true },
    ).lean<IUserDocument>();
  }

  /**
   * Stamp the current time as the last login.
   */
  async updateLastLogin(userId: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { lastLoginAt: new Date() },
      { new: true },
    ).lean<IUserDocument>();
  }

  /**
   * Set account status to inactive.
   * Used for user-initiated deactivation.
   */
  async deactivateUser(userId: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { accountStatus: AccountStatus.INACTIVE },
      { new: true },
    ).lean<IUserDocument>();
  }

  /**
   * Set account status back to active.
   */
  async activateUser(userId: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { accountStatus: AccountStatus.ACTIVE },
      { new: true },
    ).lean<IUserDocument>();
  }
}
