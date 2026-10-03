import { expect, test } from '@playwright/test';

test.describe('display preferences', () => {
  test('switches theme and increases the text size', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', {
      name: 'Préférences d’affichage',
    });

    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Sombre' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Clair' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Grande' }).click();
    await expect(page.locator('html')).toHaveCSS('font-size', '18px');
  });
});
