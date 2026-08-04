import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DonorPage } from '../pages/DonorPage';
import { ReceiverPage } from '../pages/ReceiverPage';
import { AdminPage } from '../pages/AdminPage';
import { NotificationPage } from '../pages/NotificationPage';
import { ProfilePage } from '../pages/ProfilePage';
import { createStorageState } from '../utils/auth.helpers';

type MyFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  donorPageObj: DonorPage;
  receiverPageObj: ReceiverPage;
  adminPageObj: AdminPage;
  notificationPageObj: NotificationPage;
  profilePageObj: ProfilePage;
  donorSession: void;
  adminSession: void;
  receiverSession: void;
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
  donorPageObj: async ({ page }, use) => {
    await use(new DonorPage(page));
  },
  receiverPageObj: async ({ page }, use) => {
    await use(new ReceiverPage(page));
  },
  adminPageObj: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  notificationPageObj: async ({ page }, use) => {
    await use(new NotificationPage(page));
  },
  profilePageObj: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  donorSession: async ({ page }, use) => {
    await createStorageState(page, 'donor');
    await use();
  },
  adminSession: async ({ page }, use) => {
    await createStorageState(page, 'admin');
    await use();
  },
  receiverSession: async ({ page }, use) => {
    await createStorageState(page, 'ngo');
    await use();
  },
});

export { expect } from '@playwright/test';
