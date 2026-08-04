import { Request, Response } from 'express';
import { AdminService, adminService as defaultAdminService } from '../services/admin.service';
import { UserService, userService as defaultUserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { FoodStatus, FoodCategory } from '../models/food.model';
import { ReservationStatus } from '../models/reservation.model';
import { UserRole, AccountStatus } from '../models/user.model';

export class AdminController {
  private readonly adminService: AdminService;
  private readonly userService: UserService;

  constructor(
    adminService: AdminService = defaultAdminService,
    userService: UserService = defaultUserService,
  ) {
    this.adminService = adminService;
    this.userService = userService;
  }

  /**
   * GET /api/v1/admin/dashboard
   * System overview statistics.
   */
  getDashboard = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const stats = await this.adminService.getDashboardStats();
    ApiResponse.ok(res, stats, 'Admin dashboard statistics retrieved successfully');
  });

  /**
   * GET /api/v1/admin/analytics
   * Detailed analytics (trends, distribution, growth, completion rate).
   */
  getAnalytics = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const analytics = await this.adminService.getAnalyticsStats();
    ApiResponse.ok(res, analytics, 'Admin analytics data retrieved successfully');
  });

  /**
   * GET /api/v1/admin/food
   * Admin food listing moderation queue (paginated with search & filters).
   */
  getFood = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, status, category, search } = req.query;

    const filters = {
      status: typeof status === 'string' ? (status as FoodStatus) : undefined,
      category: typeof category === 'string' ? (category as FoodCategory) : undefined,
    };

    const options = {
      page: typeof page === 'string' ? parseInt(page, 10) : 1,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : 10,
    };

    const result = await this.adminService.getAllFood(filters, options);
    ApiResponse.paginated(
      res,
      result.data,
      result.page,
      result.limit,
      result.total,
      'Admin food listings retrieved successfully',
    );
  });

  /**
   * GET /api/v1/admin/reservations
   * Admin reservation monitoring (paginated with search & status filter).
   */
  getReservations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, status } = req.query;

    const filters = {
      status: typeof status === 'string' ? (status as ReservationStatus) : undefined,
    };

    const options = {
      page: typeof page === 'string' ? parseInt(page, 10) : 1,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : 10,
    };

    const result = await this.adminService.getAllReservations(filters, options);
    ApiResponse.paginated(
      res,
      result.data,
      result.page,
      result.limit,
      result.total,
      'Admin reservations list retrieved successfully',
    );
  });

  /**
   * GET /api/v1/admin/users
   * Admin user monitoring (reuses UserService logic).
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
      sortOrder: sortOrder === 'asc' ? ('asc' as const) : ('desc' as const),
    };

    const result = await this.userService.getUsersPaginated(filters, options);
    ApiResponse.paginated(
      res,
      result.data,
      result.page,
      result.limit,
      result.total,
      'Admin users list retrieved successfully',
    );
  });
}

export const adminController = new AdminController();
