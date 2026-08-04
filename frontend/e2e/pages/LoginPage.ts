import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly errorMessageBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.forgotPasswordLink = page.getByRole('button', { name: /forgot password/i });
    this.registerLink = page.getByRole('link', { name: /register here/i });
    this.errorMessageBanner = page.locator('.bg-rose-50');
  }

  async gotoLogin() {
    await this.goto('/login');
    await expect(this.page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.gotoLogin();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async openForgotPasswordModal() {
    await this.forgotPasswordLink.click();
  }

  async expectErrorMessage(messagePattern: string | RegExp) {
    await expect(this.errorMessageBanner).toContainText(messagePattern);
  }
}
