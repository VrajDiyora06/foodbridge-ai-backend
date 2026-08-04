import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoAdminDashboard() {
    await this.goto('/admin');
    await expect(this.page).toHaveURL(/\/admin/);
    await expect(this.page.locator('text=/Admin Governance Portal|Platform Operations/i').first()).toBeVisible();
  }

  async gotoUserManagement() {
    await this.goto('/admin/users');
    await expect(this.page).toHaveURL(/\/admin\/users/);
    await expect(this.page.locator('text=/User Management|System Users/i').first()).toBeVisible();
  }

  async gotoAnalytics() {
    await this.goto('/admin/analytics');
    await expect(this.page).toHaveURL(/\/admin\/analytics/);
    await expect(this.page.locator('text=/System Analytics|Analytics/i').first()).toBeVisible();
  }
}
