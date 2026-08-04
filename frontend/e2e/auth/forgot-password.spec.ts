import { test, expect } from '../fixtures/test.fixture';

test.describe('Forgot Password E2E Flow', () => {
  test('should open forgot password modal when clicking link on login page', async ({ loginPage, page }) => {
    await loginPage.gotoLogin();
    await loginPage.openForgotPasswordModal();

    await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();
    const modalEmailInput = page.locator('.fixed.inset-0 input[type="email"]');
    await expect(modalEmailInput).toBeVisible();
  });

  test('should submit reset request and display confirmation message', async ({ loginPage, page }) => {
    await page.route('**/api/v1/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'If an account with that email exists, a password reset link has been sent.',
        }),
      });
    });

    await loginPage.gotoLogin();
    await loginPage.openForgotPasswordModal();

    const modalEmailInput = page.locator('.fixed.inset-0 input[type="email"]');
    await modalEmailInput.fill('user@example.com');

    const submitBtn = page.getByRole('button', { name: /send reset link/i });
    await submitBtn.click();

    await expect(page.getByText(/password reset link has been sent/i)).toBeVisible();
  });
});
