import en from '../../messages/en.json';
import fr from '../../messages/fr.json';

import { routing, type AppLocale } from '@/i18n/routing';

/**
 * Render the transactional auth emails from the same message catalogs that
 * power the UI, so a French or English user gets a matching email. Kept out of
 * next-intl's request pipeline on purpose: Better Auth sends these from a
 * route handler where the `[locale]` segment/middleware context is absent, so
 * the locale is resolved from the request (see `./email-locale.ts`).
 */
const catalogs = { fr, en } as const;

export type RenderedEmail = {
  subject: string;
  text: string;
};

function interpolate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? values[key] : match,
  );
}

function formatBody(lines: (string | null)[]) {
  return lines.filter((line): line is string => line !== null).join('\n');
}

export function renderResetPasswordEmail(
  locale: AppLocale,
  { name, url }: { name: string; url: string },
): RenderedEmail {
  const messages = catalogs[locale].AuthEmails.resetPassword;

  return {
    subject: messages.subject,
    text: formatBody([
      interpolate(messages.greeting, { name }),
      '',
      messages.intro,
      messages.action,
      url,
      '',
      messages.ignore,
    ]),
  };
}

export function renderVerificationEmail(
  locale: AppLocale,
  { name, url }: { name: string; url: string },
): RenderedEmail {
  const messages = catalogs[locale].AuthEmails.verifyEmail;

  return {
    subject: messages.subject,
    text: formatBody([
      interpolate(messages.greeting, { name }),
      '',
      messages.intro,
      url,
      '',
      messages.ignore,
    ]),
  };
}

export function renderChangeEmailConfirmation(
  locale: AppLocale,
  { name, newEmail, url }: { name: string; newEmail: string; url: string },
): RenderedEmail {
  const messages = catalogs[locale].AuthEmails.changeEmail;

  return {
    subject: messages.subject,
    text: formatBody([
      interpolate(messages.greeting, { name }),
      '',
      interpolate(messages.intro, { newEmail }),
      messages.action,
      url,
      '',
      messages.ignore,
    ]),
  };
}

/** Locales that have an email catalog available. */
export function isEmailLocale(value: unknown): value is AppLocale {
  return (
    typeof value === 'string' &&
    (routing.locales as readonly string[]).includes(value)
  );
}
