import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  sendVerificationEmail: vi.fn(),
  searchParams: new URLSearchParams(),
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
  authClient: { sendVerificationEmail: mocks.sendVerificationEmail },
}));

import { VerifyEmailPanel } from './verify-email-panel';

describe('VerifyEmailPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();
  });

  it('shows the verified state when the link succeeded', () => {
    mocks.searchParams = new URLSearchParams('verified=1');
    render(<VerifyEmailPanel />);

    expect(screen.getByText('Adresse email vérifiée')).toBeInTheDocument();
  });

  it('rejects an invalid email and does not submit', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPanel />);

    await user.type(screen.getByLabelText('Adresse email'), 'nope');
    await user.click(
      screen.getByRole('button', { name: /renvoyer l'email de vérification/i }),
    );

    expect(
      await screen.findByText('Cette adresse email ne semble pas valide.'),
    ).toBeInTheDocument();
    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('resends the verification email and confirms', async () => {
    mocks.sendVerificationEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<VerifyEmailPanel />);

    await user.type(screen.getByLabelText('Adresse email'), 'ada@example.com');
    await user.click(
      screen.getByRole('button', { name: /renvoyer l'email de vérification/i }),
    );

    await waitFor(() =>
      expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({
        email: 'ada@example.com',
        callbackURL: expect.stringContaining('/verify-email?verified=1'),
      }),
    );
    expect(await screen.findByText('Email envoyé')).toBeInTheDocument();
  });

  it('shows the server error when sending fails', async () => {
    mocks.sendVerificationEmail.mockResolvedValue({
      error: { message: 'Adresse déjà vérifiée.' },
    });
    const user = userEvent.setup();
    render(<VerifyEmailPanel />);

    await user.type(screen.getByLabelText('Adresse email'), 'ada@example.com');
    await user.click(
      screen.getByRole('button', { name: /renvoyer l'email de vérification/i }),
    );

    expect(
      await screen.findByText('Adresse déjà vérifiée.'),
    ).toBeInTheDocument();
  });
});
