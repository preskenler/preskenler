import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({ setTheme: vi.fn() }));

vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme: mocks.setTheme, theme: 'system' }),
}));

import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has an accessible label', () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Changer de thème' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['Clair', 'light'],
    ['Sombre', 'dark'],
    ['Système', 'system'],
  ])('sets the %s theme', async (label, value) => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Changer de thème' }));
    await user.click(await screen.findByRole('menuitem', { name: label }));

    expect(mocks.setTheme).toHaveBeenCalledWith(value);
  });
});
