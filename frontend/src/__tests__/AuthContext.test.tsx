import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const TestComponent: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'LOGGED_IN' : 'LOGGED_OUT'}</span>
      <span data-testid="user-email">{user?.email || 'NO_USER'}</span>
      <button
        onClick={() =>
          login({
            email: 'test@example.com',
            password: 'password123',
          })
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext Provider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should start in logged-out state by default', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_OUT');
    expect(screen.getByTestId('user-email')).toHaveTextContent('NO_USER');
  });

  it('should transition to logged-in state on login()', async () => {
    (authService.login as any).mockResolvedValue({
      user: {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'donor',
        accountStatus: 'active',
        isVerified: true,
        createdAt: '',
        updatedAt: '',
      },
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_IN');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });
});
