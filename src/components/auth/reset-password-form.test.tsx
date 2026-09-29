import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  resetPassword: vi.fn(),
  searchParams: new URLSearchParams('token=reset-token'),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: { resetPassword: mocks.resetPassword },
}));

import { ResetPasswordForm } from './reset-password-form';

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams('token=reset-token');
  });

  it('shows an invalid-link state when the token is missing', () => {
    mocks.searchParams = new URLSearchParams();
    render(<ResetPasswordForm />);

    expect(screen.getByText('Lien invalide')).toBeInTheDocument();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it('rejects non-matching passwords', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(
      screen.getByLabelText('Nouveau mot de passe'),
      'password123',
    );
    await user.type(
      screen.getByLabelText('Confirme le mot de passe'),
      'password124',
    );
    await user.click(
      screen.getByRole('button', { name: /réinitialiser mon mot de passe/i }),
    );

    expect(
      await screen.findByText('Les mots de passe ne correspondent pas.'),
    ).toBeInTheDocument();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it('resets the password and shows the success state', async () => {
    mocks.resetPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(
      screen.getByLabelText('Nouveau mot de passe'),
      'password123',
    );
    await user.type(
      screen.getByLabelText('Confirme le mot de passe'),
      'password123',
    );
    await user.click(
      screen.getByRole('button', { name: /réinitialiser mon mot de passe/i }),
    );

    await waitFor(() =>
      expect(mocks.resetPassword).toHaveBeenCalledWith({
        newPassword: 'password123',
        token: 'reset-token',
      }),
    );
    expect(await screen.findByText('Mot de passe modifié')).toBeInTheDocument();
  });

  it('shows the server error when the token is rejected', async () => {
    mocks.resetPassword.mockResolvedValue({
      error: { message: 'Jeton invalide.' },
    });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(
      screen.getByLabelText('Nouveau mot de passe'),
      'password123',
    );
    await user.type(
      screen.getByLabelText('Confirme le mot de passe'),
      'password123',
    );
    await user.click(
      screen.getByRole('button', { name: /réinitialiser mon mot de passe/i }),
    );

    expect(await screen.findByText('Jeton invalide.')).toBeInTheDocument();
  });
});
