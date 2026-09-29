import { describe, expect, it } from 'vitest';

import { signInSchema, signUpSchema } from './auth';

describe('signUpSchema', () => {
  const valid = {
    name: 'Ada',
    email: 'ada@example.com',
    password: 'password123',
  };

  it('accepts valid values and trims name and email', () => {
    const result = signUpSchema.parse({
      ...valid,
      name: '  Ada  ',
      email: '  ada@example.com  ',
    });

    expect(result).toEqual(valid);
  });

  it('rejects a blank name', () => {
    const result = signUpSchema.safeParse({ ...valid, name: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Entre ton nom.');
    }
  });

  it('rejects an invalid email', () => {
    const result = signUpSchema.safeParse({ ...valid, email: 'not-an-email' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['email']);
      expect(result.error.issues[0]?.message).toBe(
        'Cette adresse email ne semble pas valide.',
      );
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({ ...valid, password: 'short' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Au moins 8 caractères.');
    }
  });

  it('rejects a password longer than 128 characters', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: 'a'.repeat(129),
    });

    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('accepts an email and a non-empty password', () => {
    const result = signInSchema.parse({
      email: 'ada@example.com',
      password: 'whatever',
    });

    expect(result).toEqual({ email: 'ada@example.com', password: 'whatever' });
  });

  it('rejects an empty password without enforcing the sign-up length', () => {
    const result = signInSchema.safeParse({
      email: 'ada@example.com',
      password: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Entre ton mot de passe.');
    }
  });

  it('rejects an invalid email', () => {
    expect(
      signInSchema.safeParse({ email: 'nope', password: 'x' }).success,
    ).toBe(false);
  });
});
