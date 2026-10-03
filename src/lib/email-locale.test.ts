import { describe, expect, it } from 'vitest';

import { resolveEmailLocale } from './email-locale';

function request(headers: Record<string, string>) {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as Request;
}

describe('resolveEmailLocale', () => {
  it('uses the NEXT_LOCALE cookie when present', () => {
    expect(
      resolveEmailLocale(
        request({ cookie: 'other=1; NEXT_LOCALE=en; foo=bar' }),
      ),
    ).toBe('en');
  });

  it('falls back to Accept-Language', () => {
    expect(
      resolveEmailLocale(request({ 'accept-language': 'en-US,en;q=0.9' })),
    ).toBe('en');
  });

  it('ignores unknown cookie values', () => {
    expect(resolveEmailLocale(request({ cookie: 'NEXT_LOCALE=de' }))).toBe(
      'fr',
    );
  });

  it('defaults to the default locale', () => {
    expect(resolveEmailLocale(request({}))).toBe('fr');
    expect(resolveEmailLocale(undefined)).toBe('fr');
  });
});
