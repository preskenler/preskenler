import { z } from 'zod';

/**
 * Shared validation rules for the auth flows.
 *
 * These schemas are the single source of truth for the client-side form types
 * (the `*Values` types are inferred from them). Better Auth performs the
 * authoritative server-side validation; the rules below mirror its defaults so
 * the user gets the same feedback before the request is sent.
 *
 * Each schema is built from a translator so the messages resolve to the active
 * locale, mirroring `createContactSchema` in `./contact.ts`.
 */
export type ValidationTranslator = (key: string) => string;

export function createEmailField(t: ValidationTranslator) {
  return z
    .string()
    .trim()
    .pipe(z.email({ error: t('emailInvalid') }));
}

function createPasswordField(t: ValidationTranslator) {
  return z
    .string()
    .min(8, { error: t('passwordTooShort') })
    .max(128, { error: t('passwordTooLong') });
}

export function createSignInSchema(t: ValidationTranslator) {
  return z.object({
    email: createEmailField(t),
    password: z.string().min(1, { error: t('passwordRequired') }),
  });
}

export function createSignUpSchema(t: ValidationTranslator) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { error: t('nameRequired') })
      .max(80, { error: t('nameTooLong') }),
    email: createEmailField(t),
    password: createPasswordField(t),
  });
}

export function createForgotPasswordSchema(t: ValidationTranslator) {
  return z.object({
    email: createEmailField(t),
  });
}

export function createResetPasswordSchema(t: ValidationTranslator) {
  return z
    .object({
      password: createPasswordField(t),
      confirmPassword: z.string().min(1, { error: t('confirmRequired') }),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      error: t('confirmMismatch'),
    });
}

export function createChangePasswordSchema(t: ValidationTranslator) {
  return z
    .object({
      currentPassword: z.string().min(1, { error: t('currentRequired') }),
      newPassword: createPasswordField(t),
      confirmPassword: z.string().min(1, { error: t('confirmRequired') }),
      revokeOtherSessions: z.boolean(),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      path: ['confirmPassword'],
      error: t('confirmMismatch'),
    });
}

export function createChangeEmailSchema(t: ValidationTranslator) {
  return z.object({
    newEmail: createEmailField(t),
  });
}

export function createVerifyEmailSchema(t: ValidationTranslator) {
  return z.object({
    email: createEmailField(t),
  });
}

export type SignInValues = z.infer<ReturnType<typeof createSignInSchema>>;
export type SignUpValues = z.infer<ReturnType<typeof createSignUpSchema>>;
export type ForgotPasswordValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
export type ResetPasswordValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
export type ChangePasswordValues = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;
export type ChangeEmailValues = z.infer<
  ReturnType<typeof createChangeEmailSchema>
>;
export type VerifyEmailValues = z.infer<
  ReturnType<typeof createVerifyEmailSchema>
>;
