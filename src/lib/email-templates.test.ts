import { describe, expect, it } from 'vitest';

import {
  renderChangeEmailConfirmation,
  renderResetPasswordEmail,
  renderVerificationEmail,
} from './email-templates';

describe('renderResetPasswordEmail', () => {
  it('renders the French email with the link and greeting', () => {
    const { subject, text } = renderResetPasswordEmail('fr', {
      name: 'Ada',
      url: 'https://example.com/reset',
    });

    expect(subject).toContain('mot de passe');
    expect(text).toContain('Bonjour Ada,');
    expect(text).toContain('https://example.com/reset');
  });

  it('renders the English email', () => {
    const { subject, text } = renderResetPasswordEmail('en', {
      name: 'Ada',
      url: 'https://example.com/reset',
    });

    expect(subject).toMatch(/password/i);
    expect(text).toContain('Hello Ada,');
  });
});

describe('renderVerificationEmail', () => {
  it('includes the verification link', () => {
    expect(
      renderVerificationEmail('fr', { name: 'Ada', url: 'https://x/verify' })
        .text,
    ).toContain('https://x/verify');
  });

  it('has an English subject', () => {
    expect(
      renderVerificationEmail('en', { name: 'Ada', url: 'u' }).subject,
    ).toMatch(/Verify/);
  });
});

describe('renderChangeEmailConfirmation', () => {
  it('mentions the new address in both locales', () => {
    expect(
      renderChangeEmailConfirmation('fr', {
        name: 'Ada',
        newEmail: 'new@example.com',
        url: 'u',
      }).text,
    ).toContain('new@example.com');

    const english = renderChangeEmailConfirmation('en', {
      name: 'Ada',
      newEmail: 'new@example.com',
      url: 'u',
    });
    expect(english.text).toContain('new@example.com');
    expect(english.text).toContain('Hello Ada,');
  });
});
