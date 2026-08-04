import { test, expect } from '../fixtures/test.fixture';

test.describe('Notification System E2E Flow', () => {
  test('should navigate to notification feed page', async ({ donorSession, notificationPageObj }) => {
    await notificationPageObj.gotoNotifications();
  });
});
