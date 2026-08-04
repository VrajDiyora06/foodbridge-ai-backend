import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class NotificationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoNotifications() {
    await this.goto('/notifications');
    await expect(this.page).toHaveURL(/\/notifications/);
    await expect(this.page.locator('text=/Notifications|Notification Feed/i').first()).toBeVisible();
  }
}
