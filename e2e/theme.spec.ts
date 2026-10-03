import { expect, test } from '@playwright/test';

test.describe('display preferences', () => {
  test('switches theme and increases the text size', async ({ page }) => {
    await page.goto('/');

    // Radio items keep the menu open, so several preferences can be adjusted
    // in one go.
    await page.getByRole('button', { name: 'Préférences d’affichage' }).click();

    await page.getByRole('menuitemradio', { name: 'Sombre' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.getByRole('menuitemradio', { name: 'Clair' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await page.getByRole('menuitemradio', { name: 'Grande' }).click();
    await expect(page.locator('html')).toHaveCSS('font-size', '18px');
  });
});
