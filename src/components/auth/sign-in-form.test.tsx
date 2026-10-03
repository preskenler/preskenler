import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: { signIn: { email: mocks.signInEmail } },
}));

import { SignInForm } from './sign-in-form';

async function fillValidValues() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Adresse email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Mot de passe'), 'password123');
  return user;
}

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows field-level errors for empty fields and does not submit', async () => {
    const user = userEvent.setup();
    renderWithIntl(<SignInForm />);

    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(
      await screen.findByText('Cette adresse email ne semble pas valide.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Entre ton mot de passe.')).toBeInTheDocument();
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });

  it('submits valid values and redirects on success', async () => {
    mocks.signInEmail.mockResolvedValue({ error: null });
    renderWithIntl(<SignInForm />);

    const user = await fillValidValues();
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() =>
      expect(mocks.signInEmail).toHaveBeenCalledWith({
        email: 'ada@example.com',
        password: 'password123',
      }),
    );
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/dashboard'));
  });

  it('shows the server error when credentials are rejected', async () => {
    mocks.signInEmail.mockResolvedValue({
      error: { message: 'Identifiants invalides.' },
    });
    renderWithIntl(<SignInForm />);

    const user = await fillValidValues();
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(
      await screen.findByText('Identifiants invalides.'),
    ).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
