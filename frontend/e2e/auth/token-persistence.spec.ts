import { test, expect } from '../fixtures/test.fixture';

test.describe('Token Persistence E2E', () => {
  test('should retain user authentication state across browser reloads', async ({ page, donorPage }) => {
    await page.goto('/donor');
    await expect(page).toHaveURL(/\/donor/);

    // Hard reload browser page
    await page.reload();

    // Verify session remains active
    await expect(page).toHaveURL(/\/donor/);
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });
});
