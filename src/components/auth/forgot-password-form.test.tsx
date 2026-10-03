import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({ requestPasswordReset: vi.fn() }));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: { requestPasswordReset: mocks.requestPasswordReset },
}));

import { ForgotPasswordForm } from './forgot-password-form';

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a field-level error for an invalid email and does not submit', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('Adresse email'), 'nope');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    expect(
      await screen.findByText('Cette adresse email ne semble pas valide.'),
    ).toBeInTheDocument();
    expect(mocks.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('requests a reset and shows a neutral confirmation', async () => {
    mocks.requestPasswordReset.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithIntl(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('Adresse email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() =>
      expect(mocks.requestPasswordReset).toHaveBeenCalledWith({
        email: 'ada@example.com',
        redirectTo: expect.stringContaining('/reset-password'),
      }),
    );
    expect(await screen.findByText('Vérifie tes emails')).toBeInTheDocument();
  });

  it('shows the server error and stays on the form', async () => {
    mocks.requestPasswordReset.mockResolvedValue({
      error: { message: 'Trop de tentatives.' },
    });
    const user = userEvent.setup();
    renderWithIntl(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('Adresse email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    expect(await screen.findByText('Trop de tentatives.')).toBeInTheDocument();
  });
});
