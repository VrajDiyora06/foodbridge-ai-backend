import { api } from './api';
import type {
  ApiResponse,
  AuthResponseData,
  LoginCredentials,
  RegisterData,
  User,
} from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    return response.data.data;
  },

  async register(data: RegisterData): Promise<AuthResponseData> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore network/server errors during logout cleanup
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return response.data.message;
  },

  async resetPassword(token: string, password: string): Promise<string> {
    const response = await api.post<ApiResponse<null>>('/auth/reset-password', {
      token,
      password,
    });
    return response.data.message;
  },

  async verifyEmail(token: string): Promise<string> {
    const response = await api.post<ApiResponse<null>>('/auth/verify-email', { token });
    return response.data.message;
  },
};
