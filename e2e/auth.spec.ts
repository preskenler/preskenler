import { expect, test } from '@playwright/test';

test.describe('sign-up form validation', () => {
  test('shows field-level errors before hitting the server', async ({
    page,
  }) => {
    await page.goto('/sign-up');

    await page.getByRole('button', { name: 'Créer mon compte' }).click();

    await expect(page.getByText('Entre ton nom.')).toBeVisible();
    await expect(
      page.getByText('Cette adresse email ne semble pas valide.'),
    ).toBeVisible();
    // The help text and the error share the same wording, so target the alert.
    await expect(
      page.getByRole('alert').filter({ hasText: 'Au moins 8 caractères.' }),
    ).toBeVisible();
    // Client-side validation stops the request, so we stay on the page.
    await expect(page).toHaveURL(/\/sign-up$/);
  });
});

test.describe('sign-in form validation', () => {
  test('shows field-level errors before hitting the server', async ({
    page,
  }) => {
    await page.goto('/sign-in');

    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(
      page.getByText('Cette adresse email ne semble pas valide.'),
    ).toBeVisible();
    await expect(page.getByText('Entre ton mot de passe.')).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
