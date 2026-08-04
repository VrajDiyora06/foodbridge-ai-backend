import { test } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('../docs/assets/screenshots');

const setupMockAuth = async (page: any, role: string = 'donor') => {
  const user = {
    id: '64f1a2b3c4d5e6f7a8b9c0d1',
    name: role === 'admin' ? 'Admin System' : role === 'donor' ? 'Green Grocery Store' : 'Hope Shelter Community',
    email: `${role}@foodbridge.ai`,
    role,
    accountStatus: 'active',
    isVerified: true,
  };

  await page.route('**/api/v1/auth/me', (r: any) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: user }) }),
  );

  await page.route('**/api/v1/notifications**', (r: any) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            _id: 'n1',
            recipient: user.id,
            title: 'New Claim Request',
            message: 'Hope Shelter claimed 25 Organic Apples donation.',
            type: 'RESERVATION_CLAIMED',
            read: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'n2',
            recipient: user.id,
            title: 'Donation Approved',
            message: 'Your donation Fresh Bakery Bread has been verified.',
            type: 'FOOD_AVAILABLE',
            read: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      }),
    }),
  );

  await page.route('**/api/v1/food**', (r: any) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            _id: 'f1',
            title: 'Organic Fresh Produce Box',
            description: 'Surplus organic vegetables and fruits from morning batch.',
            quantity: 30,
            unit: 'kg',
            category: 'Produce',
            dietaryInfo: ['Vegetarian', 'Vegan'],
            status: 'available',
            donor: { _id: 'd1', name: 'Green Market' },
            location: { address: '123 Main St', coordinates: { latitude: 37.7749, longitude: -122.4194 } },
            expiryTime: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'f2',
            title: 'Artisanal Bakery Bread',
            description: 'Freshly baked sourdough loaves and whole wheat baguettes.',
            quantity: 15,
            unit: 'loaves',
            category: 'Bakery',
            dietaryInfo: ['Vegetarian'],
            status: 'claimed',
            donor: { _id: 'd1', name: 'Green Market' },
            location: { address: '456 Market St', coordinates: { latitude: 37.7833, longitude: -122.4167 } },
            expiryTime: new Date(Date.now() + 43200000).toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 2 },
      }),
    }),
  );

  await page.route('**/api/v1/reservations**', (r: any) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            _id: 'r1',
            food: { _id: 'f1', title: 'Organic Fresh Produce Box', quantity: 30, unit: 'kg' },
            claimer: { _id: 'c1', name: 'Hope Shelter' },
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 1 },
      }),
    }),
  );

  await page.route('**/api/v1/admin/dashboard', (r: any) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { users: { total: 124, donors: 45, receivers: 60, volunteers: 15, admins: 4 }, food: { total: 380, available: 42, claimed: 310, expired: 28 }, reservations: { total: 310, completed: 295, pending: 15 } },
      }),
    }),
  );

  await page.route('**/api/v1/admin/analytics', (r: any) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          donationsOverTime: [{ date: '2026-08-01', count: 12 }, { date: '2026-08-02', count: 18 }, { date: '2026-08-03', count: 25 }, { date: '2026-08-04', count: 32 }],
          userGrowth: [{ date: '2026-08-01', count: 90 }, { date: '2026-08-02', count: 105 }, { date: '2026-08-03', count: 115 }, { date: '2026-08-04', count: 124 }],
        },
      }),
    }),
  );

  await page.route('**/api/v1/admin/users**', (r: any) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          { _id: 'u1', name: 'Green Grocery Store', email: 'donor@foodbridge.ai', role: 'donor', accountStatus: 'active', isVerified: true, createdAt: new Date().toISOString() },
          { _id: 'u2', name: 'Hope Shelter Community', email: 'receiver@foodbridge.ai', role: 'ngo', accountStatus: 'active', isVerified: true, createdAt: new Date().toISOString() },
          { _id: 'u3', name: 'Alex Volunteer', email: 'volunteer@foodbridge.ai', role: 'volunteer', accountStatus: 'active', isVerified: true, createdAt: new Date().toISOString() },
        ],
        pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 3 },
      }),
    }),
  );

  await page.addInitScript(
    ({ token, userObj }) => {
      window.localStorage.setItem('accessToken', token);
      window.localStorage.setItem('refreshToken', token);
      window.localStorage.setItem('user', JSON.stringify(userObj));
    },
    { token: 'mock-session-token', userObj: user },
  );
};

test.describe('Capture Real Application Screenshots (1920x1080)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('1. home.png', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home.png'), fullPage: false });
  });

  test('2. login.png', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login.png'), fullPage: false });
  });

  test('3. register.png', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'register.png'), fullPage: false });
  });

  test('4. donor-dashboard.png', async ({ page }) => {
    await setupMockAuth(page, 'donor');
    await page.goto('/donor');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'donor-dashboard.png'), fullPage: false });
  });

  test('5. create-donation.png', async ({ page }) => {
    await setupMockAuth(page, 'donor');
    await page.goto('/donor/donate');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'create-donation.png'), fullPage: false });
  });

  test('6. my-donations.png', async ({ page }) => {
    await setupMockAuth(page, 'donor');
    await page.goto('/donor/donations');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'my-donations.png'), fullPage: false });
  });

  test('7. browse-food.png', async ({ page }) => {
    await setupMockAuth(page, 'receiver');
    await page.goto('/browse');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'browse-food.png'), fullPage: false });
  });

  test('8. food-details.png', async ({ page }) => {
    await setupMockAuth(page, 'receiver');
    await page.goto('/receiver/available');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'food-details.png'), fullPage: false });
  });

  test('9. receiver-dashboard.png', async ({ page }) => {
    await setupMockAuth(page, 'receiver');
    await page.goto('/receiver');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'receiver-dashboard.png'), fullPage: false });
  });

  test('10. my-reservations.png', async ({ page }) => {
    await setupMockAuth(page, 'receiver');
    await page.goto('/receiver/reservations');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'my-reservations.png'), fullPage: false });
  });

  test('11. notifications.png', async ({ page }) => {
    await setupMockAuth(page, 'donor');
    await page.goto('/donor');
    await page.waitForTimeout(1000);
    const notifBtn = page.locator('button[aria-label="Notifications"]');
    if (await notifBtn.isVisible()) {
      await notifBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'notifications.png'), fullPage: false });
  });

  test('12. profile.png', async ({ page }) => {
    await setupMockAuth(page, 'donor');
    await page.goto('/profile');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'profile.png'), fullPage: false });
  });

  test('13. map.png', async ({ page }) => {
    await setupMockAuth(page, 'receiver');
    await page.goto('/map/nearby');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'map.png'), fullPage: false });
  });

  test('14. admin-dashboard.png', async ({ page }) => {
    await setupMockAuth(page, 'admin');
    await page.goto('/admin');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-dashboard.png'), fullPage: false });
  });

  test('15. admin-users.png', async ({ page }) => {
    await setupMockAuth(page, 'admin');
    await page.goto('/admin/users');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-users.png'), fullPage: false });
  });

  test('16. analytics.png', async ({ page }) => {
    await setupMockAuth(page, 'admin');
    await page.goto('/admin/analytics');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'analytics.png'), fullPage: false });
  });
});
