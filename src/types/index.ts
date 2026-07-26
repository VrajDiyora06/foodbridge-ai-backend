/**
 * Extend Express Request/Response types here as the project grows.
 * Example: attach user, request ID, or tenant info to the request.
 */
import { Request } from 'express';
import { AccessTokenPayload } from '../services/token.service';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  user?: AccessTokenPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
