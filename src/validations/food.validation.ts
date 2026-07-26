import { z } from 'zod';
import { FoodCategory, FoodStatus } from '../models/food.model';

// ── Shared Sub-schemas ────────────────────────────────────

export const coordinatesSchema = z.object({
  latitude: z
    .number({ required_error: 'Latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number({ required_error: 'Longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

export const locationSchema = z.object({
  address: z
    .string({ required_error: 'Address is required' })
    .trim()
    .min(1, 'Address is required'),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(1, 'City is required'),
  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(1, 'State is required'),
  postalCode: z
    .string({ required_error: 'Postal code is required' })
    .trim()
    .min(1, 'Postal code is required'),
  country: z
    .string({ required_error: 'Country is required' })
    .trim()
    .min(1, 'Country is required'),
  coordinates: coordinatesSchema,
});

const partialLocationSchema = z
  .object({
    address: z.string().trim().min(1, 'Address cannot be empty').optional(),
    city: z.string().trim().min(1, 'City cannot be empty').optional(),
    state: z.string().trim().min(1, 'State cannot be empty').optional(),
    postalCode: z.string().trim().min(1, 'Postal code cannot be empty').optional(),
    country: z.string().trim().min(1, 'Country cannot be empty').optional(),
    coordinates: z
      .object({
        latitude: z
          .number()
          .min(-90, 'Latitude must be between -90 and 90')
          .max(90, 'Latitude must be between -90 and 90')
          .optional(),
        longitude: z
          .number()
          .min(-180, 'Longitude must be between -180 and 180')
          .max(180, 'Longitude must be between -180 and 180')
          .optional(),
      })
      .optional(),
  })
  .optional();

// ── Main Schemas ──────────────────────────────────────────

export const createFoodSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters'),

    description: z
      .string({ required_error: 'Description is required' })
      .trim()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be at most 1000 characters'),

    category: z.nativeEnum(FoodCategory, {
      required_error: 'Category is required',
      invalid_type_error: 'Invalid food category',
    }),

    quantity: z
      .number({ required_error: 'Quantity is required' })
      .positive('Quantity must be greater than 0'),

    quantityUnit: z
      .string({ required_error: 'Quantity unit is required' })
      .trim()
      .min(1, 'Quantity unit is required'),

    images: z
      .array(z.string().url('Each image must be a valid URL'))
      .max(10, 'Cannot upload more than 10 images')
      .optional()
      .default([]),

    preparedAt: z.coerce.date({ required_error: 'Preparation time is required' }),

    expiresAt: z.coerce.date({ required_error: 'Expiration time is required' }),

    isVegetarian: z.boolean().optional().default(false),

    isVegan: z.boolean().optional().default(false),

    containsAllergens: z.boolean().optional().default(false),

    allergens: z
      .array(z.string().trim().min(1, 'Allergen name cannot be empty'))
      .optional()
      .default([]),

    location: locationSchema,

    pickupStartTime: z.coerce.date({ required_error: 'Pickup start time is required' }),

    pickupEndTime: z.coerce.date({ required_error: 'Pickup end time is required' }),
  })
  .superRefine((data, ctx) => {
    if (data.expiresAt <= data.preparedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expiration time must be after preparation time',
        path: ['expiresAt'],
      });
    }

    if (data.pickupEndTime <= data.pickupStartTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pickup end time must be after pickup start time',
        path: ['pickupEndTime'],
      });
    }

    if (data.containsAllergens && (!data.allergens || data.allergens.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Allergens list is required when containsAllergens is true',
        path: ['allergens'],
      });
    }
  });

export const updateFoodSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters')
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be at most 1000 characters')
      .optional(),

    category: z.nativeEnum(FoodCategory).optional(),

    quantity: z.number().positive('Quantity must be greater than 0').optional(),

    quantityUnit: z.string().trim().min(1, 'Quantity unit cannot be empty').optional(),

    images: z
      .array(z.string().url('Each image must be a valid URL'))
      .max(10, 'Cannot upload more than 10 images')
      .optional(),

    preparedAt: z.coerce.date().optional(),

    expiresAt: z.coerce.date().optional(),

    isVegetarian: z.boolean().optional(),

    isVegan: z.boolean().optional(),

    containsAllergens: z.boolean().optional(),

    allergens: z.array(z.string().trim().min(1)).optional(),

    location: partialLocationSchema,

    pickupStartTime: z.coerce.date().optional(),

    pickupEndTime: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.preparedAt && data.expiresAt && data.expiresAt <= data.preparedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expiration time must be after preparation time',
        path: ['expiresAt'],
      });
    }

    if (data.pickupStartTime && data.pickupEndTime && data.pickupEndTime <= data.pickupStartTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pickup end time must be after pickup start time',
        path: ['pickupEndTime'],
      });
    }

    if (data.containsAllergens === true && data.allergens !== undefined && data.allergens.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Allergens list is required when containsAllergens is true',
        path: ['allergens'],
      });
    }
  });

export const foodQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  category: z.nativeEnum(FoodCategory).optional(),
  status: z.nativeEnum(FoodStatus).optional(),
  city: z.string().trim().optional(),
  vegetarian: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().optional()),
  vegan: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().optional()),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().optional().default(10),
});

export const updateFoodStatusSchema = z.object({
  status: z.nativeEnum(FoodStatus, {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid food status',
  }),
});

// ── Inferred DTO Types ───────────────────────────────────

export type CreateFoodDto = z.infer<typeof createFoodSchema>;
export type UpdateFoodDto = z.infer<typeof updateFoodSchema>;
export type FoodQueryDto = z.infer<typeof foodQuerySchema>;
export type UpdateFoodStatusDto = z.infer<typeof updateFoodStatusSchema>;
