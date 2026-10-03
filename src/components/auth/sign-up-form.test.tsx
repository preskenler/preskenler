import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  signUpEmail: vi.fn(),
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
  authClient: { signUp: { email: mocks.signUpEmail } },
}));

import { SignUpForm } from './sign-up-form';

async function fillValidValues() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nom'), '  Ada  ');
  await user.type(
    screen.getByLabelText('Adresse email'),
    '  ada@example.com  ',
  );
  await user.type(screen.getByLabelText('Mot de passe'), 'password123');
  return user;
}

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a field-level error for every invalid field and does not submit', async () => {
    const user = userEvent.setup();
    renderWithIntl(<SignUpForm />);

    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    const errorMessages = (await screen.findAllByRole('alert')).map(
      (alert) => alert.textContent,
    );
    expect(errorMessages).toContain('Entre ton nom.');
    expect(errorMessages).toContain(
      'Cette adresse email ne semble pas valide.',
    );
    expect(errorMessages).toContain('Au moins 8 caractères.');
    expect(mocks.signUpEmail).not.toHaveBeenCalled();
  });

  it('associates the error with the invalid input', async () => {
    const user = userEvent.setup();
    renderWithIntl(<SignUpForm />);

    await user.type(screen.getByLabelText('Adresse email'), 'nope');
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    const email = await screen.findByLabelText('Adresse email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(
      'Cette adresse email ne semble pas valide.',
    );
  });

  it('submits trimmed values and redirects on success', async () => {
    mocks.signUpEmail.mockResolvedValue({ error: null });
    renderWithIntl(<SignUpForm />);

    const user = await fillValidValues();
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() =>
      expect(mocks.signUpEmail).toHaveBeenCalledWith({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'password123',
        callbackURL: expect.stringContaining('/verify-email?verified=1'),
      }),
    );
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/dashboard'));
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it('shows the server error and stays on the page when sign-up fails', async () => {
    mocks.signUpEmail.mockResolvedValue({
      error: { message: 'Email déjà utilisé.' },
    });
    renderWithIntl(<SignUpForm />);

    const user = await fillValidValues();
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    expect(await screen.findByText('Email déjà utilisé.')).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('disables the submit button while the request is pending', async () => {
    let resolveRequest!: (value: { error: null }) => void;
    mocks.signUpEmail.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderWithIntl(<SignUpForm />);

    const user = await fillValidValues();
    const button = screen.getByRole('button', { name: /créer mon compte/i });
    await user.click(button);

    await waitFor(() => expect(button).toBeDisabled());

    resolveRequest({ error: null });
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/dashboard'));
  });
});
