import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({ setTheme: vi.fn() }));

vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme: mocks.setTheme, theme: 'system' }),
}));

import { DisplayPreferences } from './display-preferences';
import { TextSizeProvider } from './text-size-provider';
import { resetTextSizeStore } from '@/lib/accessibility';

function createStorage() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

let storage: ReturnType<typeof createStorage>;

function renderMenu() {
  return render(
    <TextSizeProvider>
      <DisplayPreferences />
    </TextSizeProvider>,
  );
}

describe('DisplayPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage = createStorage();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage,
    });
    document.documentElement.style.fontSize = '';
    document.documentElement.removeAttribute('data-text-size');
    resetTextSizeStore();
  });

  it('exposes an accessible label', () => {
    renderMenu();

    expect(
      screen.getByRole('button', { name: 'Préférences d’affichage' }),
    ).toBeInTheDocument();
  });

  it('sets the theme', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole('button', { name: 'Préférences d’affichage' }),
    );
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'Sombre' }),
    );

    expect(mocks.setTheme).toHaveBeenCalledWith('dark');
  });

  it('scales the text size and persists it', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole('button', { name: 'Préférences d’affichage' }),
    );
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'Grande' }),
    );

    expect(document.documentElement.style.fontSize).toBe('112.5%');
    expect(storage.getItem('preskenler-text-size')).toBe('large');
  });
});
