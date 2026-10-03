import { expect, test } from '@playwright/test';

const TRIGGER = 'Préférences d’affichage';

// One selection per test: Base UI radio menus keep/close inconsistently across
// repeated choices, and each preference is independent anyway.
test.describe('display preferences', () => {
  test('switches to the dark theme', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: TRIGGER }).click();
    await page.getByRole('menuitemradio', { name: 'Sombre' }).click();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('increases the text size', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: TRIGGER }).click();
    await page.getByRole('menuitemradio', { name: 'Grande' }).click();

    await expect(page.locator('html')).toHaveCSS('font-size', '18px');
  });
});
