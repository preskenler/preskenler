import { z } from 'zod';

/**
 * Shared validation rules for the auth flows.
 *
 * These schemas are the single source of truth for the client-side form types
 * (the `*Values` types are inferred from them). Better Auth performs the
 * authoritative server-side validation; the rules below mirror its defaults so
 * the user gets the same feedback before the request is sent.
 */

export const emailField = z
  .string()
  .trim()
  .pipe(z.email({ error: 'Cette adresse email ne semble pas valide.' }));

const passwordField = z
  .string()
  .min(8, { error: 'Au moins 8 caractères.' })
  .max(128, { error: 'Ton mot de passe est trop long.' });

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: 'Entre ton mot de passe.' }),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Entre ton nom.' })
    .max(80, { error: 'Ton nom ne peut pas dépasser 80 caractères.' }),
  email: emailField,
  password: passwordField,
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, { error: 'Confirme ton mot de passe.' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Les mots de passe ne correspondent pas.',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: 'Entre ton mot de passe actuel.' }),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, { error: 'Confirme ton mot de passe.' }),
    revokeOtherSessions: z.boolean(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Les mots de passe ne correspondent pas.',
  });

export const changeEmailSchema = z.object({
  newEmail: emailField,
});

export const verifyEmailSchema = z.object({
  email: emailField,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
