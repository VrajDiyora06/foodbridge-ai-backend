import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type {
  AuthContextType,
  User,
  LoginCredentials,
  RegisterData,
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to persist auth state
  const setSession = useCallback((newUser: User | null, newAccessToken: string | null, newRefreshToken?: string | null) => {
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
      setToken(newAccessToken);
    } else {
      localStorage.removeItem('accessToken');
      setToken(null);
    }

    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    } else if (newRefreshToken === null) {
      localStorage.removeItem('refreshToken');
    }

    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const refetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch {
      // Clear invalid session
      setSession(null, null, null);
    } finally {
      setIsLoading(false);
    }
  }, [setSession]);

  // Persistent login check on initial mount
  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  // Listen for forced logout events (e.g. refresh token failure in interceptor)
  useEffect(() => {
    const handleForceLogout = () => {
      setSession(null, null, null);
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [setSession]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      setSession(data.user, data.accessToken, data.refreshToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      if (result.accessToken && result.user) {
        setSession(result.user, result.accessToken, result.refreshToken);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setSession(null, null, null);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
