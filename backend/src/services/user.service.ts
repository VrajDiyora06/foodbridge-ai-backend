import { StatusCodes } from 'http-status-codes';
import {
  UserRepository,
  UpdateProfileData,
  UserFilters,
  UserPaginationOptions,
  PaginatedUsersResult,
} from '../repositories/user.repository';
import { IUserDocument, AccountStatus, UserRole } from '../models/user.model';
import { AppError } from '../utils/appError';
import logger from '../utils/logger';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  /**
   * Get authenticated user profile.
   */
  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User profile not found', StatusCodes.NOT_FOUND);
    }
    return user;
  }

  /**
   * Update authenticated user profile.
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<IUserDocument> {
    const updatedUser = await this.userRepo.updateProfile(userId, data);
    if (!updatedUser) {
      throw new AppError('User profile not found', StatusCodes.NOT_FOUND);
    }
    logger.info('User profile updated', { userId });
    return updatedUser;
  }

  /**
   * Admin: List users with pagination, role/status filters, and search query.
   */
  async getUsersPaginated(
    filters: UserFilters,
    options: UserPaginationOptions,
  ): Promise<PaginatedUsersResult> {
    return this.userRepo.findPaginated(filters, options);
  }

  /**
   * Admin: Get user details by ID.
   */
  async getUserById(userId: string): Promise<IUserDocument> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    return user;
  }

  /**
   * Admin: Update account status (active, suspended, inactive).
   */
  async updateUserStatus(userId: string, status: AccountStatus): Promise<IUserDocument> {
    const user = await this.userRepo.updateStatus(userId, status);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    logger.info('User status updated by admin', { userId, status });
    return user;
  }

  /**
   * Admin: Update user role.
   */
  async updateUserRole(userId: string, role: UserRole): Promise<IUserDocument> {
    const user = await this.userRepo.updateRole(userId, role);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    logger.info('User role updated by admin', { userId, role });
    return user;
  }

  /**
   * Admin: Soft delete user account.
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepo.softDelete(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    logger.info('User account soft deleted by admin', { userId });
  }
}

export const userService = new UserService();
