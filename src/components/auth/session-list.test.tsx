import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  revokeSession: vi.fn(),
  revokeOtherSessions: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
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
  });

  it('renders each session with a fallback for unknown devices', () => {
    renderWithIntl(<SessionList sessions={sessions} />);

    expect(screen.getByText('Chrome sur macOS')).toBeInTheDocument();
    expect(screen.getByText('Appareil inconnu')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /révoquer/i })).toHaveLength(
      2,
    );
  });

  it('shows an empty state when there are no sessions', () => {
    renderWithIntl(<SessionList sessions={[]} />);

    expect(screen.getByText('Aucune session active.')).toBeInTheDocument();
  });

  it('revokes a single session and refreshes', async () => {
    mocks.revokeSession.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithIntl(<SessionList sessions={sessions} />);

    await user.click(screen.getAllByRole('button', { name: /révoquer/i })[0]!);

    await waitFor(() =>
      expect(mocks.revokeSession).toHaveBeenCalledWith({ token: 'token-1' }),
    );
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it('revokes the other sessions and refreshes', async () => {
    mocks.revokeOtherSessions.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithIntl(<SessionList sessions={sessions} />);

    await user.click(
      screen.getByRole('button', { name: /déconnecter les autres sessions/i }),
    );

    await waitFor(() => expect(mocks.revokeOtherSessions).toHaveBeenCalled());
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it('shows an error when revocation fails', async () => {
    mocks.revokeSession.mockResolvedValue({
      error: { message: 'Session introuvable.' },
    });
    const user = userEvent.setup();
    renderWithIntl(<SessionList sessions={sessions} />);

    await user.click(screen.getAllByRole('button', { name: /révoquer/i })[0]!);

    expect(await screen.findByText('Session introuvable.')).toBeInTheDocument();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
