# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\refresh-token.spec.ts >> Refresh Token Interceptor E2E >> should handle automatic 401 token refresh cycle seamlessly
- Location: e2e\auth\refresh-token.spec.ts:4:3

# Error details

```
Error: page.goto: NS_ERROR_CONNECTION_REFUSED
Call log:
  - navigating to "http://127.0.0.1:5173/donor", waiting until "load"

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
  1  | import { test, expect } from '../fixtures/test.fixture';
  2  | 
  3  | test.describe('Refresh Token Interceptor E2E', () => {
  4  |   test('should handle automatic 401 token refresh cycle seamlessly', async ({ page, donorSession }) => {
  5  |     let refreshAttempted = false;
  6  | 
  7  |     await page.route('**/api/v1/auth/refresh-token', (route) => {
  8  |       refreshAttempted = true;
  9  |       route.fulfill({
  10 |         status: 200,
  11 |         contentType: 'application/json',
  12 |         body: JSON.stringify({
  13 |           success: true,
  14 |           data: {
  15 |             accessToken: 'new-mock-access-token',
  16 |             refreshToken: 'new-mock-refresh-token',
  17 |           },
  18 |         }),
  19 |       });
  20 |     });
  21 | 
> 22 |     await page.goto('/donor');
     |                ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
  23 |     await expect(page).toHaveURL(/\/donor/);
  24 |   });
  25 | });
  26 | 
```