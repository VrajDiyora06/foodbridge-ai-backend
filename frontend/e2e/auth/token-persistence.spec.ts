import { test, expect } from '../fixtures/test.fixture';

test.describe('Token Persistence E2E', () => {
  test('should retain user authentication state across browser reloads', async ({ page, donorSession }) => {
    await page.goto('/donor');
    await expect(page).toHaveURL(/\/donor/);

    await page.reload();
    await expect(page).toHaveURL(/\/donor/);
  });
});
