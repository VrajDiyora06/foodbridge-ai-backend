import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly donorRoleButton: Locator;
  readonly ngoRoleButton: Locator;
  readonly volunteerRoleButton: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly successMessageBanner: Locator;
  readonly errorMessageBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('input[name="name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.donorRoleButton = page.getByRole('button', { name: /food donor/i });
    this.ngoRoleButton = page.getByRole('button', { name: /ngo/i });
    this.volunteerRoleButton = page.getByRole('button', { name: /volunteer/i });
    this.submitButton = page.getByRole('button', { name: /create account/i });
    this.loginLink = page.getByRole('link', { name: /sign in/i });
    this.successMessageBanner = page.locator('.bg-emerald-50');
    this.errorMessageBanner = page.locator('.bg-rose-50');
  }

  async gotoRegister() {
    await this.goto('/register');
    await expect(this.page.getByRole('heading', { name: /create an account/i })).toBeVisible();
  }

  async selectRole(role: 'donor' | 'ngo' | 'volunteer') {
    if (role === 'donor') await this.donorRoleButton.click();
    else if (role === 'ngo') await this.ngoRoleButton.click();
    else if (role === 'volunteer') await this.volunteerRoleButton.click();
  }

  async registerUser(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role?: 'donor' | 'ngo' | 'volunteer';
  }) {
    await this.gotoRegister();
    if (data.role) {
      await this.selectRole(data.role);
    }
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword || data.password);
    await this.submitButton.click();
  }
}
