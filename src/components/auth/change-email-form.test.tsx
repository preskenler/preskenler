import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({ changeEmail: vi.fn() }));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: { changeEmail: mocks.changeEmail },
}));

import { ChangeEmailForm } from './change-email-form';

describe('ChangeEmailForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the current email when provided', () => {
    renderWithIntl(<ChangeEmailForm currentEmail="old@example.com" />);

    expect(
      screen.getByText('Adresse actuelle : old@example.com'),
    ).toBeInTheDocument();
  });

  it('rejects an invalid new email and does not submit', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ChangeEmailForm />);

    await user.type(screen.getByLabelText('Nouvelle adresse email'), 'nope');
    await user.click(
      screen.getByRole('button', { name: /changer mon adresse email/i }),
    );

    expect(
      await screen.findByText('Cette adresse email ne semble pas valide.'),
    ).toBeInTheDocument();
    expect(mocks.changeEmail).not.toHaveBeenCalled();
  });

  it('submits the new email and shows the confirmation state', async () => {
    mocks.changeEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithIntl(<ChangeEmailForm />);

    await user.type(
      screen.getByLabelText('Nouvelle adresse email'),
      'new@example.com',
    );
    await user.click(
      screen.getByRole('button', { name: /changer mon adresse email/i }),
    );

    await waitFor(() =>
      expect(mocks.changeEmail).toHaveBeenCalledWith({
        newEmail: 'new@example.com',
        callbackURL: expect.stringContaining('/dashboard?account=info'),
      }),
    );
    expect(await screen.findByText('Vérifie tes emails')).toBeInTheDocument();
  });

  it('shows the server error when the change is rejected', async () => {
    mocks.changeEmail.mockResolvedValue({
      error: { message: 'Adresse déjà utilisée.' },
    });
    const user = userEvent.setup();
    renderWithIntl(<ChangeEmailForm />);

    await user.type(
      screen.getByLabelText('Nouvelle adresse email'),
      'new@example.com',
    );
    await user.click(
      screen.getByRole('button', { name: /changer mon adresse email/i }),
    );

    expect(
      await screen.findByText('Adresse déjà utilisée.'),
    ).toBeInTheDocument();
  });
});
