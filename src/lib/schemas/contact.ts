import { z } from 'zod';

import { emailField } from './auth';

/**
 * Contact form rules (demande D04). Validated on the client for immediate
 * feedback and re-validated inside the server action before the insert.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Entre ton nom.' })
    .max(120, { error: 'Ton nom ne peut pas dépasser 120 caractères.' }),
  email: emailField,
  service: z.string().trim().min(1, { error: 'Choisis un service.' }),
  message: z
    .string()
    .trim()
    .min(10, {
      error: 'Décris ta demande en quelques mots (10 caractères minimum).',
    })
    .max(2000, { error: 'Ton message ne peut pas dépasser 2000 caractères.' }),
});

export type ContactValues = z.infer<typeof contactSchema>;
