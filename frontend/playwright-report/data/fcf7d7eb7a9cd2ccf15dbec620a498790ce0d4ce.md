# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile\profile-flow.spec.ts >> Profile & Settings E2E Flow >> should navigate to user profile page
- Location: e2e\profile\profile-flow.spec.ts:4:3

# Error details

```
Error: page.goto: NS_ERROR_CONNECTION_REFUSED
Call log:
  - navigating to "http://127.0.0.1:5173/profile", waiting until "load"

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
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | export class BasePage {
  4  |   readonly page: Page;
  5  | 
  6  |   constructor(page: Page) {
  7  |     this.page = page;
  8  |   }
  9  | 
  10 |   async goto(path: string = '/') {
> 11 |     await this.page.goto(path);
     |                     ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
  12 |   }
  13 | 
  14 |   async waitForURL(urlPattern: string | RegExp) {
  15 |     await this.page.waitForURL(urlPattern);
  16 |   }
  17 | 
  18 |   async expectHeading(text: string) {
  19 |     await expect(this.page.getByRole('heading', { name: text })).toBeVisible();
  20 |   }
  21 | 
  22 |   async expectTextVisible(text: string) {
  23 |     await expect(this.page.getByText(text)).toBeVisible();
  24 |   }
  25 | 
  26 |   async takeSnapshot(snapshotName: string) {
  27 |     await expect(this.page).toHaveScreenshot(snapshotName, {
  28 |       maxDiffPixelRatio: 0.05,
  29 |     });
  30 |   }
  31 | }
  32 | 
```