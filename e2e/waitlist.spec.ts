import { expect, test } from '@playwright/test';

test.describe('waitlist form', () => {
  test('rejects an invalid email', async ({ page }) => {
    await page.goto('/');

    const email = page.getByLabel('Adresse email');
    await email.fill('nope');
    await page.getByRole('button', { name: 'Me prévenir' }).click();

    await expect(
      page.getByText('Cette adresse email ne semble pas valide.'),
    ).toBeVisible();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows the success state after a valid submission', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Adresse email').fill('ada@example.com');
    await page.getByRole('button', { name: 'Me prévenir' }).click();

    await expect(page.getByRole('status')).toHaveText(
      'Merci ! On te tiendra au courant du lancement.',
    );
  });
});
