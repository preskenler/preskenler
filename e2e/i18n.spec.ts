import { expect, test } from '@playwright/test';

test.describe('locale routing', () => {
  test('keeps the default locale unprefixed and serves English under /en', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: 'Bienvenue sur le portail de Terra Nova',
      }),
    ).toBeVisible();

    await page.goto('/en');
    await expect(
      page.getByRole('heading', { name: 'Welcome to the Terra Nova portal' }),
    ).toBeVisible();
  });

  test('switches locale from the header and remembers it', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Langue').selectOption('en');

    await expect(page).toHaveURL(/\/en$/);
    await expect(
      page.getByRole('heading', { name: 'Welcome to the Terra Nova portal' }),
    ).toBeVisible();

    // The proxy stores the choice in a cookie; a later visit to `/` keeps it.
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });
});
