import { z } from 'zod';
import { UserRole, AccountStatus } from '../models/user.model';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    organizationName: z.string().nullable().optional(),
  }).strict({
    message: 'Cannot modify protected user fields (role, password, status, email verification)',
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(AccountStatus, {
      errorMap: () => ({ message: 'Status must be one of: active, inactive, suspended' }),
    }),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Role must be one of: user, donor, ngo, volunteer, admin' }),
    }),
  }),
});

export const userQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(AccountStatus).optional(),
    search: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>['body'];
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>['body'];
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>['body'];
export type UserQueryDto = z.infer<typeof userQuerySchema>['query'];
