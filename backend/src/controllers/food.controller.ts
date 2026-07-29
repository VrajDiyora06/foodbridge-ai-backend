import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { FoodService, foodService as defaultFoodService } from '../services/food.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';
import type { FoodQueryDto } from '../validations/food.validation';

/**
 * Controller handling food donation listing endpoints.
 * Delegated directly to FoodService. All responses use ApiResponse.
 */
export class FoodController {
  private readonly foodService: FoodService;

  constructor(service: FoodService = defaultFoodService) {
    this.foodService = service;
  }

  /**
   * POST /api/v1/food
   * Create a new food donation listing (authenticated donor).
   */
  createFood = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const result = await this.foodService.createFood(authReq.userId, req.body);
    ApiResponse.created(res, result, 'Food donation listing created successfully');
  });

  /**
   * GET /api/v1/food/:id
   * Get details of a food listing by ID with populated donor information.
   */
  getFoodById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const result = await this.foodService.getFoodById(id);
    ApiResponse.ok(res, result, 'Food listing details fetched successfully');
  });

  /**
   * GET /api/v1/food
   * Get available food listings matching query filters and pagination.
   */
  getAvailableFood = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as FoodQueryDto;
    const result = await this.foodService.getAvailableFood(query);

    ApiResponse.paginated(
      res,
      result.data,
      result.page,
      result.limit,
      result.total,
      'Available food listings fetched successfully',
    );
  });

  /**
   * GET /api/v1/food/nearby
   * Get available food listings near geographical coordinates (latitude, longitude, radiusKm).
   */
  getNearbyFood = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.foodService.getNearbyFood(latitude, longitude, radiusKm, {
      page,
      limit,
    });

    ApiResponse.paginated(
      res,
      result.data,
      result.page,
      result.limit,
      result.total,
      'Nearby food listings fetched successfully',
    );
  });

  /**
   * GET /api/v1/food/my
   * Get all food listings created by the currently authenticated donor.
   */
  getMyFood = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    const result = await this.foodService.getDonorFood(authReq.userId, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    ApiResponse.paginated(
      res,
      result.data,
      result.page,
      result.limit,
      result.total,
      'My food listings fetched successfully',
    );
  });

  /**
   * PATCH /api/v1/food/:id
   * Update food listing details (authenticated owner only).
   */
  updateFood = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    const result = await this.foodService.updateFood(id, authReq.userId, req.body);
    ApiResponse.ok(res, result, 'Food listing updated successfully');
  });

  /**
   * PATCH /api/v1/food/:id/status
   * Update food listing status (authenticated owner only).
   */
  updateFoodStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    const { status } = req.body;
    const result = await this.foodService.updateFoodStatus(id, authReq.userId, status);
    ApiResponse.ok(res, result, 'Food listing status updated successfully');
  });

  /**
   * DELETE /api/v1/food/:id
   * Delete a food listing (authenticated owner only).
   */
  deleteFood = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    await this.foodService.deleteFood(id, authReq.userId);
    ApiResponse.ok(res, null, 'Food listing deleted successfully');
  });

  /**
   * GET /api/v1/food/my/statistics
   * Get aggregate statistics for food listings of the authenticated donor.
   */
  getFoodStatistics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const result = await this.foodService.getFoodStatistics(authReq.userId);
    ApiResponse.ok(res, result, 'Food statistics fetched successfully');
  });
}

// Export singleton instance for route mounting
export const foodController = new FoodController();
