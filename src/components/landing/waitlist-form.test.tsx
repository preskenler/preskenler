import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WaitlistForm } from './waitlist-form';

describe('WaitlistForm', () => {
  it('shows a field-level error for an invalid email', async () => {
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByLabelText('Adresse email'), 'nope');
    await user.click(screen.getByRole('button', { name: /me prévenir/i }));

    const email = screen.getByLabelText('Adresse email');
    expect(
      await screen.findByText('Cette adresse email ne semble pas valide.'),
    ).toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the success state after a valid submission', async () => {
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByLabelText('Adresse email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /me prévenir/i }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Merci ! On te tiendra au courant du lancement.',
      ),
    );
  });
});
