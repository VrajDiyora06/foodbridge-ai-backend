import { test, expect } from '../fixtures/test.fixture';

test.describe('Login E2E Flow', () => {
  test('should render login page elements and heading correctly', async ({ loginPage }) => {
    await loginPage.gotoLogin();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show visual error message on invalid credentials login', async ({ loginPage, page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          statusCode: 401,
          message: 'Invalid email or password',
        }),
      });
    });

    await loginPage.login('invalid@example.com', 'WrongPassword123!');
    await loginPage.expectErrorMessage(/invalid email or password/i);
  });

  test('should perform visual regression snapshot check on login page', async ({ loginPage }) => {
    await loginPage.gotoLogin();
    await loginPage.takeSnapshot('login-page-visual.png');
  });
});
