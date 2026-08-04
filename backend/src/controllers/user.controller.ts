import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService, userService as defaultUserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';
import { AccountStatus, UserRole } from '../models/user.model';

export class UserController {
  private readonly userService: UserService;

  constructor(service: UserService = defaultUserService) {
    this.userService = service;
  }

  /**
   * GET /api/v1/users/me
   * Get authenticated user profile.
   */
  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const user = await this.userService.getProfile(authReq.userId);
    ApiResponse.ok(res, user, 'User profile retrieved successfully');
  });

  /**
   * PUT /api/v1/users/me
   * Update authenticated user profile.
   */
  updateMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const updatedUser = await this.userService.updateProfile(authReq.userId, req.body);
    ApiResponse.ok(res, updatedUser, 'User profile updated successfully');
  });

  /**
   * GET /api/v1/users
   * Admin: List users with pagination, role/status filters, and search.
   */
  getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, role, status, search, sortBy, sortOrder } = req.query;

    const filters = {
      role: typeof role === 'string' ? (role as UserRole) : undefined,
      accountStatus: typeof status === 'string' ? (status as AccountStatus) : undefined,
      search: typeof search === 'string' ? search : undefined,
    };

    const options = {
      page: typeof page === 'string' ? parseInt(page, 10) : 1,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : 10,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      sortOrder: sortOrder === 'asc' ? 'asc' as const : 'desc' as const,
    };

    const result = await this.userService.getUsersPaginated(filters, options);
    ApiResponse.paginated(
      res,
      result.data,
      result.page,
      result.limit,
      result.total,
      'Users list retrieved successfully',
    );
  });

  /**
   * GET /api/v1/users/:id
   * Admin: Get user details by ID.
   */
  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const user = await this.userService.getUserById(id);
    ApiResponse.ok(res, user, 'User details retrieved successfully');
  });

  /**
   * PATCH /api/v1/users/:id/status
   * Admin: Update user account status (active, suspended, inactive).
   */
  updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { status } = req.body;

    const updatedUser = await this.userService.updateUserStatus(id, status);
    ApiResponse.ok(res, updatedUser, `User status updated to ${status} successfully`);
  });

  /**
   * PATCH /api/v1/users/:id/role
   * Admin: Update user role.
   */
  updateRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { role } = req.body;

    const updatedUser = await this.userService.updateUserRole(id, role);
    ApiResponse.ok(res, updatedUser, `User role updated to ${role} successfully`);
  });

  /**
   * DELETE /api/v1/users/:id
   * Admin: Soft delete user account.
   */
  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await this.userService.deleteUser(id);
    ApiResponse.ok(res, null, 'User account soft deleted successfully');
  });
}

export const userController = new UserController();
