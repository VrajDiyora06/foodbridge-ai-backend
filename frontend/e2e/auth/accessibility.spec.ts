import { test, expect } from '../fixtures/test.fixture';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit (@axe-core/playwright)', () => {
  test('login page should not have any automatically detectable accessibility violations', async ({ loginPage, page }) => {
    await loginPage.gotoLogin();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast', 'region', 'landmark-one-main', 'page-has-heading-one', 'heading-order', 'button-name'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('register page should not have any automatically detectable accessibility violations', async ({ registerPage, page }) => {
    await registerPage.gotoRegister();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast', 'region', 'landmark-one-main', 'page-has-heading-one', 'heading-order', 'button-name'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
