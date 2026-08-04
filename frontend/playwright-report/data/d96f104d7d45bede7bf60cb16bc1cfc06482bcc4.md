# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: capture-screenshots.spec.ts >> Capture Real Application Screenshots (1920x1080) >> 16. analytics.png
- Location: e2e\capture-screenshots.spec.ts:272:3

# Error details

```
Error: page.goto: NS_ERROR_CONNECTION_REFUSED
Call log:
  - navigating to "http://127.0.0.1:5173/admin/analytics", waiting until "load"

```

# Page snapshot

```yaml
- article [ref=e3]:
  - generic [ref=e6]:
    - heading "Unable to connect" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - text: Nightly can’t connect to the server at
      - strong [ref=e9]: 127.0.0.1:5173
    - generic [ref=e10]:
      - heading "What can you do about it?" [level=3] [ref=e11]
      - list [ref=e12]:
        - listitem [ref=e13]: The site could be temporarily unavailable or too busy. Try again in a few moments.
        - listitem [ref=e14]: If you are unable to load any pages, check your computer’s network connection.
        - listitem [ref=e15]: If your computer or network is protected by a firewall or proxy, make sure that Nightly is permitted to access the web.
    - button "Try Again" [ref=e18]
```

# Test source

```ts
  174 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login.png'), fullPage: false });
  175 |   });
  176 | 
  177 |   test('3. register.png', async ({ page }) => {
  178 |     await page.goto('/register');
  179 |     await page.waitForTimeout(1000);
  180 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'register.png'), fullPage: false });
  181 |   });
  182 | 
  183 |   test('4. donor-dashboard.png', async ({ page }) => {
  184 |     await setupMockAuth(page, 'donor');
  185 |     await page.goto('/donor');
  186 |     await page.waitForTimeout(1500);
  187 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'donor-dashboard.png'), fullPage: false });
  188 |   });
  189 | 
  190 |   test('5. create-donation.png', async ({ page }) => {
  191 |     await setupMockAuth(page, 'donor');
  192 |     await page.goto('/donor/donate');
  193 |     await page.waitForTimeout(1500);
  194 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'create-donation.png'), fullPage: false });
  195 |   });
  196 | 
  197 |   test('6. my-donations.png', async ({ page }) => {
  198 |     await setupMockAuth(page, 'donor');
  199 |     await page.goto('/donor/donations');
  200 |     await page.waitForTimeout(1500);
  201 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'my-donations.png'), fullPage: false });
  202 |   });
  203 | 
  204 |   test('7. browse-food.png', async ({ page }) => {
  205 |     await setupMockAuth(page, 'receiver');
  206 |     await page.goto('/browse');
  207 |     await page.waitForTimeout(1500);
  208 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'browse-food.png'), fullPage: false });
  209 |   });
  210 | 
  211 |   test('8. food-details.png', async ({ page }) => {
  212 |     await setupMockAuth(page, 'receiver');
  213 |     await page.goto('/receiver/available');
  214 |     await page.waitForTimeout(1500);
  215 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'food-details.png'), fullPage: false });
  216 |   });
  217 | 
  218 |   test('9. receiver-dashboard.png', async ({ page }) => {
  219 |     await setupMockAuth(page, 'receiver');
  220 |     await page.goto('/receiver');
  221 |     await page.waitForTimeout(1500);
  222 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'receiver-dashboard.png'), fullPage: false });
  223 |   });
  224 | 
  225 |   test('10. my-reservations.png', async ({ page }) => {
  226 |     await setupMockAuth(page, 'receiver');
  227 |     await page.goto('/receiver/reservations');
  228 |     await page.waitForTimeout(1500);
  229 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'my-reservations.png'), fullPage: false });
  230 |   });
  231 | 
  232 |   test('11. notifications.png', async ({ page }) => {
  233 |     await setupMockAuth(page, 'donor');
  234 |     await page.goto('/donor');
  235 |     await page.waitForTimeout(1000);
  236 |     const notifBtn = page.locator('button[aria-label="Notifications"]');
  237 |     if (await notifBtn.isVisible()) {
  238 |       await notifBtn.click();
  239 |       await page.waitForTimeout(1000);
  240 |     }
  241 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'notifications.png'), fullPage: false });
  242 |   });
  243 | 
  244 |   test('12. profile.png', async ({ page }) => {
  245 |     await setupMockAuth(page, 'donor');
  246 |     await page.goto('/profile');
  247 |     await page.waitForTimeout(1500);
  248 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'profile.png'), fullPage: false });
  249 |   });
  250 | 
  251 |   test('13. map.png', async ({ page }) => {
  252 |     await setupMockAuth(page, 'receiver');
  253 |     await page.goto('/map/nearby');
  254 |     await page.waitForTimeout(2000);
  255 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'map.png'), fullPage: false });
  256 |   });
  257 | 
  258 |   test('14. admin-dashboard.png', async ({ page }) => {
  259 |     await setupMockAuth(page, 'admin');
  260 |     await page.goto('/admin');
  261 |     await page.waitForTimeout(1500);
  262 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-dashboard.png'), fullPage: false });
  263 |   });
  264 | 
  265 |   test('15. admin-users.png', async ({ page }) => {
  266 |     await setupMockAuth(page, 'admin');
  267 |     await page.goto('/admin/users');
  268 |     await page.waitForTimeout(1500);
  269 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-users.png'), fullPage: false });
  270 |   });
  271 | 
  272 |   test('16. analytics.png', async ({ page }) => {
  273 |     await setupMockAuth(page, 'admin');
> 274 |     await page.goto('/admin/analytics');
      |                ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
  275 |     await page.waitForTimeout(1500);
  276 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'analytics.png'), fullPage: false });
  277 |   });
  278 | });
  279 | 
```