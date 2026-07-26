import { Router } from 'express';
import { foodController } from '../controllers/food.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { UserRole } from '../models/user.model';
import {
  createFoodSchema,
  updateFoodSchema,
  updateFoodStatusSchema,
  foodQuerySchema,
} from '../validations/food.validation';

const router = Router();

/**
 * Public routes
 */
router.get('/', validate(foodQuerySchema), foodController.getAvailableFood);
router.get('/nearby', validate(foodQuerySchema), foodController.getNearbyFood);

/**
 * Authenticated donor / admin routes (static paths must come before /:id)
 */
router.get(
  '/my',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(foodQuerySchema),
  foodController.getMyFood,
);

router.get(
  '/my/statistics',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  foodController.getFoodStatistics,
);

/**
 * Public detail route
 */
router.get('/:id', foodController.getFoodById);

/**
 * Authenticated donor / admin mutations
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(createFoodSchema),
  foodController.createFood,
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateFoodSchema),
  foodController.updateFood,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  validate(updateFoodStatusSchema),
  foodController.updateFoodStatus,
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.DONOR, UserRole.ADMIN),
  foodController.deleteFood,
);

export default router;
