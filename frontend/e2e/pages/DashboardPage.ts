import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly navbar: Locator;
  readonly sidebar: Locator;
  readonly pageHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.navbar = page.locator('nav');
    this.sidebar = page.locator('aside');
    this.pageHeader = page.locator('h1');
  }

  async expectLoggedInAs(role: 'donor' | 'receiver' | 'admin') {
    if (role === 'donor') {
      await expect(this.page).toHaveURL(/\/donor/);
    } else if (role === 'admin') {
      await expect(this.page).toHaveURL(/\/admin/);
    } else {
      await expect(this.page).toHaveURL(/\/receiver/);
    }
  }
}
