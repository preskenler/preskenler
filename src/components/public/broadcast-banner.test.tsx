import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { BroadcastBanner } from '@/components/public/broadcast-banner';
import type { BroadcastView } from '@/lib/broadcasts';
import { renderWithIntl, screen, waitFor } from '@/test/render';

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const items: BroadcastView[] = [
  {
    id: 'flood',
    level: 'alert',
    topic: 'flood',
    audience: 'all',
    title: 'Montée des eaux',
    body: 'Évite les berges jusqu’à nouvel ordre.',
    area: 'Quartier sud',
    recommendations: [],
    isAi: false,
  },
  {
    id: 'welcome',
    level: 'info',
    topic: 'general',
    audience: 'all',
    title: 'Bienvenue',
    body: 'Le portail municipal est ouvert.',
    area: null,
    recommendations: [],
    isAi: false,
  },
];

describe('BroadcastBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders active messages as a continuously scrolling ticker', () => {
    const { container } = renderWithIntl(<BroadcastBanner items={items} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Montée des eaux');
    expect(screen.getByRole('alert')).toHaveTextContent('Bienvenue');
    expect(
      container.querySelector('.animate-broadcast-ticker'),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '.animate-broadcast-ticker > [aria-hidden="true"]',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('dismisses the complete ticker', async () => {
    const user = userEvent.setup();
    renderWithIntl(<BroadcastBanner items={items} />);

    await user.click(
      screen.getByRole('button', { name: 'Masquer le bandeau d’alertes' }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
