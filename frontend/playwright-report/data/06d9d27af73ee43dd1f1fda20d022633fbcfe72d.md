# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\unauthorized.spec.ts >> Unauthorized Redirect E2E >> should redirect unauthenticated request to /login with state
- Location: e2e\auth\unauthorized.spec.ts:4:3

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
  1 | import { test, expect } from '../fixtures/test.fixture';
  2 | 
  3 | test.describe('Unauthorized Redirect E2E', () => {
  4 |   test('should redirect unauthenticated request to /login with state', async ({ page }) => {
> 5 |     await page.goto('/donor');
    |                ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
  6 |     await expect(page).toHaveURL(/\/login/);
  7 |   });
  8 | });
  9 | 
```