import { z } from 'zod';

/**
 * Shared validation rules for the auth flows.
 *
 * These schemas are the single source of truth for the client-side form types
 * (`SignInValues` / `SignUpValues` are inferred from them). Better Auth performs
 * the authoritative server-side validation; the rules below mirror its defaults
 * so the user gets the same feedback before the request is sent.
 */

const email = z
  .string()
  .trim()
  .pipe(z.email({ error: 'Cette adresse email ne semble pas valide.' }));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: 'Entre ton mot de passe.' }),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Entre ton nom.' })
    .max(80, { error: 'Ton nom ne peut pas dépasser 80 caractères.' }),
  email,
  password: z
    .string()
    .min(8, { error: 'Au moins 8 caractères.' })
    .max(128, { error: 'Ton mot de passe est trop long.' }),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
