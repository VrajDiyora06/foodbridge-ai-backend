import { test, expect } from '../fixtures/test.fixture';

test.describe('Admin Console E2E Flow', () => {
  test('should navigate to admin console dashboard', async ({ adminSession, adminPageObj }) => {
    await adminPageObj.gotoAdminDashboard();
  });

  test('should navigate to admin user management page', async ({ adminSession, adminPageObj }) => {
    await adminPageObj.gotoUserManagement();
  });

  test('should navigate to admin analytics page', async ({ adminSession, adminPageObj }) => {
    await adminPageObj.gotoAnalytics();
  });
});
