import { expect, test } from '@playwright/test';

const TRIGGER = 'Préférences d’affichage';

// One selection per test: each preference is independent and this avoids
// depending on the radio menu's open/close behavior.
test.describe('display preferences', () => {
  test('switches to the dark theme', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: TRIGGER }).click();
    await page
      .getByRole('menuitemradio', { name: 'Sombre', exact: true })
      .click();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('increases the text size', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: TRIGGER }).click();
    await page
      .getByRole('menuitemradio', { name: 'Grande', exact: true })
      .click();

    await expect(page.locator('html')).toHaveCSS('font-size', '18px');
  });
});
