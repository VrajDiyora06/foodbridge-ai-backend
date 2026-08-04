import { Page, Locator } from '@playwright/test';

export class NavbarComponent {
  readonly page: Page;
  readonly userMenuButton: Locator;
  readonly logoutButton: Locator;
  readonly notificationBell: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenuButton = page.locator('button[aria-label="User Account Menu"]');
    this.logoutButton = page.getByRole('button', { name: /sign out|logout/i });
    this.notificationBell = page.locator('button[aria-label="Notifications"]');
  }

  async logout() {
    await this.userMenuButton.click();
    await this.logoutButton.click();
  }

  async openNotifications() {
    await this.notificationBell.click();
  }
}
