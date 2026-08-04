import { test, expect } from '../fixtures/test.fixture';

test.describe('Receiver Portal E2E Flow', () => {
  test('should navigate to receiver dashboard', async ({ receiverSession, receiverPageObj }) => {
    await receiverPageObj.gotoReceiverDashboard();
  });

  test('should navigate to available food catalog page', async ({ receiverSession, receiverPageObj }) => {
    await receiverPageObj.gotoAvailableFood();
  });

  test('should navigate to my reservations page', async ({ receiverSession, receiverPageObj }) => {
    await receiverPageObj.gotoMyReservations();
  });
});
