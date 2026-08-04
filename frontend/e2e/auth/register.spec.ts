import { test, expect } from '../fixtures/test.fixture';

test.describe('Registration E2E Flow', () => {
  test('should render registration page elements correctly', async ({ registerPage }) => {
    await registerPage.gotoRegister();

    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should allow role selection during registration', async ({ registerPage }) => {
    await registerPage.gotoRegister();

    await registerPage.selectRole('ngo');
    await expect(registerPage.ngoRoleButton).toHaveClass(/border-emerald-600/);

    await registerPage.selectRole('volunteer');
    await expect(registerPage.volunteerRoleButton).toHaveClass(/border-emerald-600/);
  });

  test('should navigate to login page when clicking sign in link', async ({ registerPage, page }) => {
    await registerPage.gotoRegister();
    await registerPage.loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });
});
