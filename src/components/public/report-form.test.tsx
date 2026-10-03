import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { renderWithIntl, screen, waitFor } from '@/test/render';

const mocks = vi.hoisted(() => ({ submit: vi.fn() }));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: unknown; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  ),
}));

vi.mock('@/app/[locale]/(public)/reports/actions', () => ({
  submitProblemReport: mocks.submit,
}));

import { ReportForm } from './report-form';

async function fillRequiredFields() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Ton nom'), 'Alex Habitant');
  await user.type(
    screen.getByLabelText('Adresse email'),
    'alex@terranova.city',
  );
  await user.type(screen.getByLabelText('Lieu'), '12 rue des Fondateurs');
  await user.type(
    screen.getByLabelText('Que s’est-il passé ?'),
    'Le lampadaire devant l’école ne fonctionne plus.',
  );
  return user;
}

describe('ReportForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks submission and shows errors when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ReportForm defaultName="" defaultEmail="" />);

    await user.click(
      screen.getByRole('button', { name: /envoyer le signalement/i }),
    );

    expect(await screen.findByText('Indique ton nom.')).toBeInTheDocument();
    expect(
      screen.getByText('Précise le lieu du problème.'),
    ).toBeInTheDocument();
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('shows the tracking reference after a successful report', async () => {
    mocks.submit.mockResolvedValue({ reference: 'PR-ABCDEFGH' });
    renderWithIntl(<ReportForm defaultName="" defaultEmail="" />);

    const user = await fillRequiredFields();
    await user.click(
      screen.getByRole('button', { name: /envoyer le signalement/i }),
    );

    await waitFor(() => expect(mocks.submit).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('PR-ABCDEFGH')).toBeInTheDocument();
  });

  it('shows a server error when the action fails', async () => {
    mocks.submit.mockResolvedValue({ error: 'Envoi impossible.' });
    renderWithIntl(<ReportForm defaultName="" defaultEmail="" />);

    const user = await fillRequiredFields();
    await user.click(
      screen.getByRole('button', { name: /envoyer le signalement/i }),
    );

    expect(await screen.findByText('Envoi impossible.')).toBeInTheDocument();
  });
});
