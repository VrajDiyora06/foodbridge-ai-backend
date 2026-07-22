import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HealthService } from '../services/health.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

const healthService = new HealthService();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Application health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All systems operational
 *       503:
 *         description: One or more systems degraded/unhealthy
 */
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = await healthService.check();

  const statusCode =
    health.status === 'healthy' ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;

  ApiResponse.send(res, statusCode, health.status, health);
});
