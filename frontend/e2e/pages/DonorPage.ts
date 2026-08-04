import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DonorPage extends BasePage {
  readonly donateFoodButton: Locator;

  constructor(page: Page) {
    super(page);
    this.donateFoodButton = page.getByRole('link', { name: /donate food/i });
  }

  async gotoDonorDashboard() {
    await this.goto('/donor');
    await expect(this.page).toHaveURL(/\/donor/);
    await expect(this.page.locator('text=/Donor Control Center|Share surplus food/i').first()).toBeVisible();
  }

  async gotoDonateFood() {
    await this.goto('/donor/donate');
    await expect(this.page).toHaveURL(/\/donor\/donate/);
    await expect(this.page.locator('text=/Donate Surplus Food|Donate Food/i').first()).toBeVisible();
  }

  async gotoMyDonations() {
    await this.goto('/donor/donations');
    await expect(this.page).toHaveURL(/\/donor\/donations/);
    await expect(this.page.locator('text=/My Food Donations|My Donations/i').first()).toBeVisible();
  }
}
