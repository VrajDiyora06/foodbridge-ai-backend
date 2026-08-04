import { test, expect } from '../fixtures/test.fixture';

test.describe('Profile & Settings E2E Flow', () => {
  test('should navigate to user profile page', async ({ donorSession, profilePageObj }) => {
    await profilePageObj.gotoProfile();
  });

  test('should navigate to edit profile page', async ({ donorSession, profilePageObj }) => {
    await profilePageObj.gotoEditProfile();
  });

  test('should navigate to security settings page', async ({ donorSession, profilePageObj }) => {
    await profilePageObj.gotoSecurity();
  });
});
