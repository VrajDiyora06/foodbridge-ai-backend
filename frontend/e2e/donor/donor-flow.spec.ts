import { test, expect } from '../fixtures/test.fixture';

test.describe('Donor Portal E2E Flow', () => {
  test('should navigate to donor dashboard and display metrics cards', async ({ donorSession, donorPageObj }) => {
    await donorPageObj.gotoDonorDashboard();
  });

  test('should navigate to create donation page and render donation form', async ({ donorSession, donorPageObj }) => {
    await donorPageObj.gotoDonateFood();
  });

  test('should navigate to my donations list page', async ({ donorSession, donorPageObj }) => {
    await donorPageObj.gotoMyDonations();
  });
});
