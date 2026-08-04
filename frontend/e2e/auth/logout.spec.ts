import { test, expect } from '../fixtures/test.fixture';
import { logoutUser } from '../utils/auth.helpers';

test.describe('Logout E2E Flow', () => {
  test('should clear authenticated tokens and redirect to login on logout', async ({ page, donorPage }) => {
    await page.goto('/donor');

    // Trigger logout via helper
    await logoutUser(page);

    await expect(page).toHaveURL(/\/login/);

    // Verify localStorage tokens are removed
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(token).toBeNull();
    expect(user).toBeNull();
  });
});
