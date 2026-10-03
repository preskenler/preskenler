import { randomBytes } from 'node:crypto';

/**
 * Unambiguous alphabet for human-readable reference codes: no `I`, `O`, `0`
 * or `1`, so a citizen can read their confirmation code over the phone.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Builds a human-readable reference such as `PR-7K3M9QXB` (demandes D16/F25).
 * 8 symbols over a 32-character alphabet give ~10^12 combinations, so
 * collisions stay negligible while the code remains easy to transcribe.
 */
export function generateReference(prefix: string): string {
  const bytes = randomBytes(8);
  let code = '';
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return `${prefix}-${code}`;
}
