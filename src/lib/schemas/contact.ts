import { z } from 'zod';

/**
 * Contact form rules (demande D04). Validated on the client for immediate
 * feedback and re-validated inside the server action before the insert.
 *
 * The schema is built from a translator so the messages resolve to the active
 * locale on both sides of the boundary.
 */
export type ValidationTranslator = (key: string) => string;

export function createContactSchema(t: ValidationTranslator) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { error: t('name.required') })
      .max(120, { error: t('name.max120') }),
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: t('email.invalid') })),
    service: z
      .string()
      .trim()
      .min(1, { error: t('service.required') }),
    message: z
      .string()
      .trim()
      .min(10, { error: t('message.min') })
      .max(2000, { error: t('message.max2000') }),
  });
}

export type ContactValues = z.infer<ReturnType<typeof createContactSchema>>;
