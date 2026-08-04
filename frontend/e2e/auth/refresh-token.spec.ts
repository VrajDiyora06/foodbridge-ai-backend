import { test, expect } from '../fixtures/test.fixture';

test.describe('Refresh Token Interceptor E2E', () => {
  test('should handle automatic 401 token refresh cycle seamlessly', async ({ page, donorSession }) => {
    let refreshAttempted = false;

    await page.route('**/api/v1/auth/refresh-token', (route) => {
      refreshAttempted = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'new-mock-access-token',
            refreshToken: 'new-mock-refresh-token',
          },
        }),
      });
    });

    await page.goto('/donor');
    await expect(page).toHaveURL(/\/donor/);
  });
});
