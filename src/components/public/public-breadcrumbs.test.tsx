import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithIntl, screen } from '@/test/render';

const mocks = vi.hoisted(() => ({ pathname: '/services' }));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
  usePathname: () => mocks.pathname,
}));

import { PublicBreadcrumbs } from './public-breadcrumbs';

describe('PublicBreadcrumbs', () => {
  beforeEach(() => {
    mocks.pathname = '/services';
  });

  it('renders a trail with a link home and the current section', () => {
    renderWithIntl(<PublicBreadcrumbs />);

    expect(
      screen.getByRole('navigation', { name: 'Fil d’Ariane' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Accueil' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  it('renders nothing on the home page', () => {
    mocks.pathname = '/';
    const { container } = renderWithIntl(<PublicBreadcrumbs />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the announcement title on a detail page', () => {
    mocks.pathname = '/announcements/ouverture-portail-numerique';
    renderWithIntl(<PublicBreadcrumbs />);

    expect(
      screen.getByText('Le portail numérique de Terra Nova ouvre ses services'),
    ).toBeInTheDocument();
  });
});
