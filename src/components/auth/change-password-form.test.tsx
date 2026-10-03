import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({ changePassword: vi.fn() }));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: { changePassword: mocks.changePassword },
}));

import { ChangePasswordForm } from './change-password-form';

async function fillValidValues() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Mot de passe actuel'), 'old-password');
  await user.type(
    screen.getByLabelText('Nouveau mot de passe'),
    'new-password-1',
  );
  await user.type(
    screen.getByLabelText('Confirme le nouveau mot de passe'),
    'new-password-1',
  );
  return user;
}

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows field-level errors for empty fields and does not submit', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ChangePasswordForm />);

    await user.click(
      screen.getByRole('button', { name: /mettre à jour mon mot de passe/i }),
    );

    const errorMessages = (await screen.findAllByRole('alert')).map(
      (alert) => alert.textContent,
    );
    expect(errorMessages).toContain('Entre ton mot de passe actuel.');
    expect(errorMessages).toContain('Au moins 8 caractères.');
    expect(errorMessages).toContain('Confirme ton mot de passe.');
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it('rejects non-matching new passwords', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ChangePasswordForm />);

    await user.type(
      screen.getByLabelText('Mot de passe actuel'),
      'old-password',
    );
    await user.type(
      screen.getByLabelText('Nouveau mot de passe'),
      'new-password-1',
    );
    await user.type(
      screen.getByLabelText('Confirme le nouveau mot de passe'),
      'new-password-2',
    );
    await user.click(
      screen.getByRole('button', { name: /mettre à jour mon mot de passe/i }),
    );

    expect(
      await screen.findByText('Les mots de passe ne correspondent pas.'),
    ).toBeInTheDocument();
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it('submits with revokeOtherSessions enabled by default', async () => {
    mocks.changePassword.mockResolvedValue({ error: null });
    renderWithIntl(<ChangePasswordForm />);

    const user = await fillValidValues();
    await user.click(
      screen.getByRole('button', { name: /mettre à jour mon mot de passe/i }),
    );

    await waitFor(() =>
      expect(mocks.changePassword).toHaveBeenCalledWith({
        currentPassword: 'old-password',
        newPassword: 'new-password-1',
        revokeOtherSessions: true,
      }),
    );
    expect(await screen.findByText('Mot de passe modifié')).toBeInTheDocument();
  });

  it('honours unchecking the revoke-other-sessions option', async () => {
    mocks.changePassword.mockResolvedValue({ error: null });
    renderWithIntl(<ChangePasswordForm />);

    const user = await fillValidValues();
    await user.click(
      screen.getByRole('checkbox', {
        name: /déconnecter mes autres appareils/i,
      }),
    );
    await user.click(
      screen.getByRole('button', { name: /mettre à jour mon mot de passe/i }),
    );

    await waitFor(() =>
      expect(mocks.changePassword).toHaveBeenCalledWith(
        expect.objectContaining({ revokeOtherSessions: false }),
      ),
    );
  });

  it('shows the server error when the current password is wrong', async () => {
    mocks.changePassword.mockResolvedValue({
      error: { message: 'Mot de passe incorrect.' },
    });
    renderWithIntl(<ChangePasswordForm />);

    const user = await fillValidValues();
    await user.click(
      screen.getByRole('button', { name: /mettre à jour mon mot de passe/i }),
    );

    expect(
      await screen.findByText('Mot de passe incorrect.'),
    ).toBeInTheDocument();
  });
});
