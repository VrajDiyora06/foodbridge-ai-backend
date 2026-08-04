import { test, expect } from '../fixtures/test.fixture';
import { logoutUser } from '../utils/auth.helpers';

test.describe('Logout E2E Flow', () => {
  test('should clear authenticated tokens and redirect to login on logout', async ({ page, donorSession }) => {
    await page.goto('/donor');
    await logoutUser(page);
    await expect(page).toHaveURL(/\/login/);
  });
});
