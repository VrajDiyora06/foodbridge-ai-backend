import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NavbarComponent } from '../pages/components/NavbarComponent';

export const loginUser = async (page: Page, credentials: { email: string; password: string }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(credentials.email, credentials.password);
};

export const registerUser = async (
  page: Page,
  data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role?: 'donor' | 'ngo' | 'volunteer';
  },
) => {
  const registerPage = new RegisterPage(page);
  await registerPage.registerUser(data);
};

export const logoutUser = async (page: Page) => {
  const navbar = new NavbarComponent(page);
  await navbar.logout();
};

export const createStorageState = async (
  page: Page,
  role: 'donor' | 'ngo' | 'volunteer' | 'admin' = 'donor',
) => {
  const mockToken = 'mock-access-token-12345';
  const mockRefreshToken = 'mock-refresh-token-12345';
  const mockUser = {
    id: '64f1a2b3c4d5e6f7a8b9c0d1',
    name: `Test ${role.toUpperCase()}`,
    email: `${role}@example.com`,
    role,
    accountStatus: 'active',
    isVerified: true,
  };

  // Mock /auth/me & /users/me so AuthContext and useProfile succeed instantly
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockUser }),
    });
  });

  await page.route('**/api/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockUser }),
    });
  });

  await page.route('**/api/v1/notifications**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 0 },
      }),
    });
  });

  await page.route('**/api/v1/food**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 0 },
      }),
    });
  });

  await page.route('**/api/v1/reservations**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 0 },
      }),
    });
  });

  await page.route('**/api/v1/admin**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { users: { total: 10 }, food: { total: 20 }, reservations: { total: 15 } },
      }),
    });
  });

  await page.addInitScript(
    ({ token, refreshToken, user }) => {
      window.localStorage.setItem('accessToken', token);
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('refreshToken', refreshToken);
      window.localStorage.setItem('user', JSON.stringify(user));
    },
    { token: mockToken, refreshToken: mockRefreshToken, user: mockUser },
  );
};
