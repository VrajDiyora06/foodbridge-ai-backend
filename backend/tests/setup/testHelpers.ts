import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from './fixtures';

export const api = request(app);

export const authHeader = (userId: string, role: string): { Authorization: string } => ({
  Authorization: `Bearer ${generateAccessToken(userId, role)}`,
});
