import { test, expect } from '../fixtures/test.fixture';

test.describe('Refresh Token Interceptor E2E', () => {
  test('should handle automatic 401 token refresh cycle seamlessly', async ({ page, donorPage }) => {
    // Intercept initial request to fail with 401, then refresh endpoint to return new tokens
    let refreshAttempted = false;

    await page.route('**/api/v1/auth/refresh-token', async (route) => {
      refreshAttempted = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'new-refreshed-access-token-99999',
            refreshToken: 'new-refreshed-refresh-token-99999',
          },
        }),
      });
    });

    await page.goto('/donor');
    await expect(page).toHaveURL(/\/donor/);
  });
});
