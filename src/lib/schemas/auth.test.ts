import { describe, expect, it } from 'vitest';

import {
  changeEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from './auth';

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

describe('forgotPasswordSchema', () => {
  it('accepts and trims a valid email', () => {
    expect(forgotPasswordSchema.parse({ email: '  ada@example.com ' })).toEqual(
      { email: 'ada@example.com' },
    );
  });

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(
      false,
    );
  });
});

describe('resetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'password123',
        confirmPassword: 'password123',
      }).success,
    ).toBe(true);
  });

  it('rejects a short password', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Au moins 8 caractères.');
    }
  });

  it('rejects non-matching passwords on the confirmation field', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'password124',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
      expect(result.error.issues[0]?.message).toBe(
        'Les mots de passe ne correspondent pas.',
      );
    }
  });
});

describe('changePasswordSchema', () => {
  const valid = {
    currentPassword: 'old-password',
    newPassword: 'new-password-1',
    confirmPassword: 'new-password-1',
    revokeOtherSessions: true,
  };

  it('accepts matching new passwords', () => {
    expect(changePasswordSchema.parse(valid)).toEqual(valid);
  });

  it('requires the current password', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      currentPassword: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Entre ton mot de passe actuel.',
      );
    }
  });

  it('rejects non-matching new passwords', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      confirmPassword: 'different',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });
});

describe('changeEmailSchema', () => {
  it('accepts and trims a valid new email', () => {
    expect(changeEmailSchema.parse({ newEmail: ' new@example.com ' })).toEqual({
      newEmail: 'new@example.com',
    });
  });

  it('rejects an invalid new email', () => {
    expect(changeEmailSchema.safeParse({ newEmail: 'nope' }).success).toBe(
      false,
    );
  });
});

describe('verifyEmailSchema', () => {
  it('accepts a valid email', () => {
    expect(
      verifyEmailSchema.safeParse({ email: 'ada@example.com' }).success,
    ).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(verifyEmailSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});
