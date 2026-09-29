import { expect, test } from '@playwright/test';

test.describe('theme switcher', () => {
  test('switches to dark and back to light', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Changer de thème' }).click();
    await page.getByRole('menuitem', { name: 'Sombre' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Changer de thème' }).click();
    await page.getByRole('menuitem', { name: 'Clair' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
