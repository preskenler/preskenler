import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';

import { renderWithIntl, screen } from '@/test/render';
import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  it('toggles the input type and announces the state', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PasswordInput id="pwd" aria-label="Mot de passe" />);

    const input = screen.getByLabelText('Mot de passe');
    expect(input).toHaveAttribute('type', 'password');

    const show = screen.getByRole('button', {
      name: 'Afficher le mot de passe',
    });
    expect(show).toHaveAttribute('aria-pressed', 'false');

    await user.click(show);

    expect(input).toHaveAttribute('type', 'text');

    const hide = screen.getByRole('button', {
      name: 'Masquer le mot de passe',
    });
    expect(hide).toHaveAttribute('aria-pressed', 'true');

    await user.click(hide);

    expect(input).toHaveAttribute('type', 'password');
  });

  it('forwards the ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>();
    renderWithIntl(
      <PasswordInput ref={ref} id="pwd" aria-label="Mot de passe" />,
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
