import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  listSessions: vi.fn(),
  revokeSession: vi.fn(),
  revokeOtherSessions: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    listSessions: mocks.listSessions,
    revokeSession: mocks.revokeSession,
    revokeOtherSessions: mocks.revokeOtherSessions,
  },
}));

import { SessionList, type SessionInfo } from './session-list';

const sessions: SessionInfo[] = [
  {
    id: 'session-1',
    token: 'token-1',
    createdAt: '2026-01-01T10:00:00.000Z',
    userAgent: 'Chrome sur macOS',
    ipAddress: '1.2.3.4',
  },
  {
    id: 'session-2',
    token: 'token-2',
    createdAt: '2026-01-02T10:00:00.000Z',
    userAgent: null,
    ipAddress: null,
  },
];

describe('SessionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listSessions.mockResolvedValue({ data: sessions, error: null });
  });

  it('loads each session with a fallback for unknown devices', async () => {
    renderWithIntl(<SessionList />);

    expect(await screen.findByText('Chrome sur macOS')).toBeInTheDocument();
    expect(screen.getByText('Appareil inconnu')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /révoquer/i })).toHaveLength(
      2,
    );
  });

  it('shows an empty state when there are no sessions', async () => {
    mocks.listSessions.mockResolvedValue({ data: [], error: null });
    renderWithIntl(<SessionList />);

    expect(
      await screen.findByText('Aucune session active.'),
    ).toBeInTheDocument();
  });

  it('shows an error when loading fails', async () => {
    mocks.listSessions.mockResolvedValue({
      data: null,
      error: { message: 'Requête refusée.' },
    });
    renderWithIntl(<SessionList />);

    expect(await screen.findByText('Requête refusée.')).toBeInTheDocument();
  });

  it('revokes a single session and reloads', async () => {
    mocks.revokeSession.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithIntl(<SessionList />);

    await screen.findByText('Chrome sur macOS');
    await user.click(screen.getAllByRole('button', { name: /révoquer/i })[0]!);

    await waitFor(() =>
      expect(mocks.revokeSession).toHaveBeenCalledWith({ token: 'token-1' }),
    );
    expect(mocks.listSessions).toHaveBeenCalledTimes(2);
  });

  it('revokes the other sessions and reloads', async () => {
    mocks.revokeOtherSessions.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithIntl(<SessionList />);

    await screen.findByText('Chrome sur macOS');
    await user.click(
      screen.getByRole('button', { name: /déconnecter les autres sessions/i }),
    );

    await waitFor(() => expect(mocks.revokeOtherSessions).toHaveBeenCalled());
    expect(mocks.listSessions).toHaveBeenCalledTimes(2);
  });

  it('shows an error when revocation fails', async () => {
    mocks.revokeSession.mockResolvedValue({
      error: { message: 'Session introuvable.' },
    });
    const user = userEvent.setup();
    renderWithIntl(<SessionList />);

    await screen.findByText('Chrome sur macOS');
    await user.click(screen.getAllByRole('button', { name: /révoquer/i })[0]!);

    expect(await screen.findByText('Session introuvable.')).toBeInTheDocument();
  });
});
