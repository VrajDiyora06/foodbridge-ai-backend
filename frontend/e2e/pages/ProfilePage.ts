import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoProfile() {
    await this.goto('/profile');
    await expect(this.page).toHaveURL(/\/profile/);
    await expect(this.page.locator('text=/User Profile|Profile/i').first()).toBeVisible();
  }

  async gotoEditProfile() {
    await this.goto('/profile/edit');
    await expect(this.page).toHaveURL(/\/profile\/edit/);
    await expect(this.page.locator('text=/Edit Profile|Profile Editor/i').first()).toBeVisible();
  }

  async gotoSecurity() {
    await this.goto('/profile/security');
    await expect(this.page).toHaveURL(/\/profile\/security/);
    await expect(this.page.locator('text=/Security & Password|Password/i').first()).toBeVisible();
  }
}
