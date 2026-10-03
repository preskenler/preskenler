import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: { signOut: mocks.signOut },
}));

import { SignOutButton } from './sign-out-button';

describe('SignOutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs out and redirects to the sign-in page', async () => {
    mocks.signOut.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithIntl(<SignOutButton />);

    await user.click(screen.getByRole('button', { name: /se déconnecter/i }));

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalled());
    expect(mocks.push).toHaveBeenCalledWith('/sign-in');
    expect(mocks.refresh).toHaveBeenCalled();
  });
});
