import { useState, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  listSessions: vi.fn(),
  changePassword: vi.fn(),
  changeEmail: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    listSessions: mocks.listSessions,
    changePassword: mocks.changePassword,
    changeEmail: mocks.changeEmail,
    deleteUser: mocks.deleteUser,
  },
}));

import { AccountDialog, type AccountSection } from './account-dialog';

function Harness() {
  const [section, setSection] = useState<AccountSection>('info');

  return (
    <AccountDialog
      open
      onOpenChange={() => {}}
      section={section}
      onSectionChange={setSection}
      user={{
        name: 'Camille Martin',
        email: 'camille@example.com',
        emailVerified: true,
      }}
    />
  );
}

describe('AccountDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listSessions.mockResolvedValue({ data: [], error: null });
  });

  it('opens on the information section by default', async () => {
    renderWithIntl(<Harness />);

    expect(
      await screen.findByText('Informations du compte'),
    ).toBeInTheDocument();
  });

  it('switches the pane when another section is chosen', async () => {
    const user = userEvent.setup();
    renderWithIntl(<Harness />);

    await user.click(
      screen.getAllByRole('button', { name: 'Mot de passe' })[0]!,
    );

    expect(
      await screen.findByText('Changer mon mot de passe'),
    ).toBeInTheDocument();
  });

  it('loads the active sessions when the sessions section is opened', async () => {
    const user = userEvent.setup();
    renderWithIntl(<Harness />);

    await user.click(screen.getAllByRole('button', { name: 'Sessions' })[0]!);

    expect(await screen.findByText('Sessions actives')).toBeInTheDocument();
    expect(mocks.listSessions).toHaveBeenCalled();
  });

  it('returns to information from the change-password success state', async () => {
    mocks.changePassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithIntl(<Harness />);

    await user.click(
      screen.getAllByRole('button', { name: 'Mot de passe' })[0]!,
    );
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
      'new-password-1',
    );
    await user.click(
      screen.getByRole('button', { name: /mettre à jour mon mot de passe/i }),
    );

    expect(await screen.findByText('Mot de passe modifié')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retour au compte' }));

    expect(
      await screen.findByText('Informations du compte'),
    ).toBeInTheDocument();
  });
});
