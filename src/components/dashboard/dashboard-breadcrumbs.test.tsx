import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithIntl, screen } from '@/test/render';

const mocks = vi.hoisted(() => ({ pathname: '/dashboard/reports' }));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
  usePathname: () => mocks.pathname,
}));

import { DashboardBreadcrumbs } from './dashboard-breadcrumbs';

describe('DashboardBreadcrumbs', () => {
  beforeEach(() => {
    mocks.pathname = '/dashboard/reports';
  });

  it('links back to the dashboard and names the section', () => {
    renderWithIntl(<DashboardBreadcrumbs />);

    expect(
      screen.getByRole('link', { name: 'Tableau de bord' }),
    ).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Signalements')).toBeInTheDocument();
  });

  it('renders nothing on the overview', () => {
    mocks.pathname = '/dashboard';
    const { container } = renderWithIntl(<DashboardBreadcrumbs />);

    expect(container).toBeEmptyDOMElement();
  });
});
