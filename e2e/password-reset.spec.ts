import { expect, test } from '@playwright/test';

test.describe('forgot password', () => {
  test('validates the email before requesting a reset', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByRole('button', { name: 'Envoyer le lien' }).click();
    await expect(
      page.getByText('Cette adresse email ne semble pas valide.'),
    ).toBeVisible();

    await page.getByLabel('Adresse email').fill('nope');
    await page.getByRole('button', { name: 'Envoyer le lien' }).click();
    await expect(
      page.getByText('Cette adresse email ne semble pas valide.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });
});

test.describe('reset password', () => {
  test('shows an invalid-link state without a token', async ({ page }) => {
    await page.goto('/reset-password');

    await expect(page.getByText('Lien invalide')).toBeVisible();
  });

  test('rejects non-matching passwords', async ({ page }) => {
    await page.goto('/reset-password?token=demo-token');

    await page.getByLabel('Nouveau mot de passe').fill('password123');
    await page.getByLabel('Confirme le mot de passe').fill('password124');
    await page
      .getByRole('button', { name: 'Réinitialiser mon mot de passe' })
      .click();

    await expect(
      page.getByText('Les mots de passe ne correspondent pas.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/reset-password/);
  });
});

test.describe('verify email', () => {
  test('validates the email before resending', async ({ page }) => {
    await page.goto('/verify-email');

    await page
      .getByRole('button', { name: "Renvoyer l'email de vérification" })
      .click();
    await expect(
      page.getByText('Cette adresse email ne semble pas valide.'),
    ).toBeVisible();
  });
});
