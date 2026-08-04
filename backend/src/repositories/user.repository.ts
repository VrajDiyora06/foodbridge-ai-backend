import User, {
  IUserDocument,
  UserRole,
  AccountStatus,
} from '../models/user.model';

export interface CreateUserData {
  name: string;
  email: string;
  password: string; // already hashed by the service layer
  role?: UserRole;
  isVerified?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  organizationName?: string | null;
}

export interface UserFilters {
  role?: UserRole;
  accountStatus?: AccountStatus;
  search?: string;
  isDeleted?: boolean;
}

export interface UserPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsersResult {
  data: IUserDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
      isVerified: data.isVerified ?? false,
    });
    return user;
  }

  /**
   * Find a user by email. Returns null if not found.
   * Password is NOT included (select: false on schema).
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } }).lean<IUserDocument>();
  }

  /**
   * Find a user by ID. Returns null if not found.
   * Password is NOT included.
   */
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findOne({ _id: id, isDeleted: { $ne: true } }).lean<IUserDocument>();
  }

  /**
   * Find a user by ID with the password field included.
   * Only the auth service should call this (during login / password reset).
   */
  async findByIdWithPassword(id: string): Promise<IUserDocument | null> {
    return User.findOne({ _id: id, isDeleted: { $ne: true } }).select('+password').lean<IUserDocument>();
  }

  /**
   * Find a user by email with the password field included.
   * Used during login to verify credentials.
   */
  async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } }).select('+password').lean<IUserDocument>();
  }

  /**
   * Check whether an email is already registered.
   * Uses countDocuments with limit 1 — faster than findOne
   * because it stops scanning after the first match.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase(), isDeleted: { $ne: true } }).limit(1);
    return count > 0;
  }

  /**
   * Update allowed profile attributes.
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).lean<IUserDocument>();
  }

  /**
   * Paginated listing with filtering and search (Admin).
   */
  async findPaginated(
    filters: UserFilters = {},
    options: UserPaginationOptions = {},
  ): Promise<PaginatedUsersResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      isDeleted: filters.isDeleted ?? { $ne: true },
    };

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.accountStatus) {
      query.accountStatus = filters.accountStatus;
    }

    if (filters.search && filters.search.trim() !== '') {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { organizationName: searchRegex },
        { phone: searchRegex },
      ];
    }

    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [data, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit).lean<IUserDocument[]>(),
      User.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Admin: Update account status (active, suspended, inactive).
   */
  async updateStatus(userId: string, status: AccountStatus): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { accountStatus: status },
      { new: true },
    ).lean<IUserDocument>();
  }

  /**
   * Admin: Update user role.
   */
  async updateRole(userId: string, role: UserRole): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).lean<IUserDocument>();
  }

  /**
   * Admin: Soft delete user account.
   */
  async softDelete(userId: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        accountStatus: AccountStatus.INACTIVE,
      },
      { new: true },
    ).lean<IUserDocument>();
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
