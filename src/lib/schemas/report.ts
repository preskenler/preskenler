import { z } from 'zod';

import { problemCategories } from '@/lib/reports';

export type ValidationTranslator = (key: string) => string;

/**
 * Problem-report form rules (demande F25). Mirrors the server action guard for
 * `ProblemReport`; messages are localized through the `Validation.report`
 * namespace on both the client and the server.
 */
export function createReportSchema(t: ValidationTranslator) {
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
    category: z.enum(problemCategories, { error: t('category.required') }),
    location: z
      .string()
      .trim()
      .min(3, { error: t('location.min') })
      .max(200, { error: t('location.max200') }),
    description: z
      .string()
      .trim()
      .min(10, { error: t('description.min') })
      .max(2000, { error: t('description.max2000') }),
  });
}

export type ReportValues = z.infer<ReturnType<typeof createReportSchema>>;
