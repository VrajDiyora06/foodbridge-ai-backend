import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { createStorageState } from '../utils/auth.helpers';

type MyFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  donorPage: void;
  adminPage: void;
  ngoPage: void;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  donorPage: async ({ page }, use) => {
    await createStorageState(page, 'donor');
    await use();
  },
  adminPage: async ({ page }, use) => {
    await createStorageState(page, 'admin');
    await use();
  },
  ngoPage: async ({ page }, use) => {
    await createStorageState(page, 'ngo');
    await use();
  },
});

export { expect } from '@playwright/test';
