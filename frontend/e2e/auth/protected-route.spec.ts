import { test, expect } from '../fixtures/test.fixture';

test.describe('Protected Route Guard E2E', () => {
  test('should redirect unauthenticated user from /donor to /login', async ({ page }) => {
    await page.goto('/donor');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated user from /admin to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated user from /profile to /login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow donor access to /donor dashboard when authenticated as donor', async ({ page, donorSession }) => {
    await page.goto('/donor');
    await expect(page).toHaveURL(/\/donor/);
  });

  test('should allow admin access to /admin portal when authenticated as admin', async ({ page, adminSession }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
  });
});
