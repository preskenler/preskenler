import { describe, expect, it } from 'vitest';

import { generateReference } from './reference';

describe('generateReference', () => {
  it('prefixes the code and keeps it unambiguous', () => {
    const reference = generateReference('PR');

    expect(reference).toMatch(/^PR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
    // No easily-confused characters (I, O, 0, 1).
    expect(reference).not.toMatch(/[IO01]/);
  });

  it('produces distinct references', () => {
    const references = new Set(
      Array.from({ length: 50 }, () => generateReference('RDV')),
    );

    expect(references.size).toBe(50);
  });
});
