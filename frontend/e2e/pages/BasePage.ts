import { Page, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  async waitForURL(urlPattern: string | RegExp) {
    await this.page.waitForURL(urlPattern);
  }

  async expectHeading(text: string) {
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible();
  }

  async expectTextVisible(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async takeSnapshot(snapshotName: string) {
    await expect(this.page).toHaveScreenshot(snapshotName, {
      maxDiffPixelRatio: 0.05,
    });
  }
}
