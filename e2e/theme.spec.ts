import { expect, test, type Page } from '@playwright/test';

async function choosePreference(page: Page, name: string) {
  const item = page.getByRole('menuitemradio', { name });

  // The menu may stay open (radio items) or close after a change; make sure the
  // item is reachable before clicking it.
  if (!(await item.isVisible())) {
    await page.getByRole('button', { name: 'Préférences d’affichage' }).click();
  }

  await item.click();
}

test.describe('display preferences', () => {
  test('switches theme and increases the text size', async ({ page }) => {
    await page.goto('/');

    await choosePreference(page, 'Sombre');
    await expect(page.locator('html')).toHaveClass(/dark/);

    await choosePreference(page, 'Clair');
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await choosePreference(page, 'Grande');
    await expect(page.locator('html')).toHaveCSS('font-size', '18px');
  });
});
