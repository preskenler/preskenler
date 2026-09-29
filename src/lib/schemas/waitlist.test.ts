import { describe, expect, it } from 'vitest';

import { waitlistSchema } from './waitlist';

describe('waitlistSchema', () => {
  it('accepts and trims a valid email', () => {
    const result = waitlistSchema.parse({ email: '  ada@example.com  ' });

    expect(result).toEqual({ email: 'ada@example.com' });
  });

  it('rejects an empty email', () => {
    const result = waitlistSchema.safeParse({ email: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Cette adresse email ne semble pas valide.',
      );
    }
  });

  it('rejects a malformed email', () => {
    expect(waitlistSchema.safeParse({ email: 'ada@' }).success).toBe(false);
  });
});
