import { z } from 'zod';
import { FoodStatus, FoodCategory } from '../models/food.model';
import { ReservationStatus } from '../models/reservation.model';

export const adminFoodQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    status: z.nativeEnum(FoodStatus).optional(),
    category: z.nativeEnum(FoodCategory).optional(),
    search: z.string().optional(),
  }),
});

export const adminReservationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    status: z.nativeEnum(ReservationStatus).optional(),
    search: z.string().optional(),
  }),
});

export type AdminFoodQueryDto = z.infer<typeof adminFoodQuerySchema>['query'];
export type AdminReservationQueryDto = z.infer<typeof adminReservationQuerySchema>['query'];
