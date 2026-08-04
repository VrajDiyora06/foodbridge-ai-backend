import type { User } from '../../../types/auth';

export interface UserProfile extends User {
  phone?: string;
  address?: string;
  avatar?: string;
  organizationName?: string;
  bio?: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  organizationName?: string;
  bio?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
