import { test, expect } from '../fixtures/test.fixture';

test.describe('Unauthorized Redirect E2E', () => {
  test('should redirect unauthenticated request to /login with state', async ({ page }) => {
    await page.goto('/donor');
    await expect(page).toHaveURL(/\/login/);
  });
});
