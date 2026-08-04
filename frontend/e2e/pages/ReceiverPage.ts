import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReceiverPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoReceiverDashboard() {
    await this.goto('/receiver');
    await expect(this.page).toHaveURL(/\/receiver/);
    await expect(this.page.locator('text=/Receiver & NGO Portal|Claim fresh food/i').first()).toBeVisible();
  }

  async gotoAvailableFood() {
    await this.goto('/receiver/available');
    await expect(this.page).toHaveURL(/\/receiver\/available/);
    await expect(this.page.locator('text=/Available Food|Browse/i').first()).toBeVisible();
  }

  async gotoMyReservations() {
    await this.goto('/receiver/reservations');
    await expect(this.page).toHaveURL(/\/receiver\/reservations/);
    await expect(this.page.locator('text=/My Reservations|Reservations/i').first()).toBeVisible();
  }
}
