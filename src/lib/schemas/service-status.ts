import { z } from 'zod';

import { serviceAvailabilityStatuses } from '@/lib/service-status';

export type ValidationTranslator = (key: string) => string;

/**
 * Staff form rules for updating a service's availability (demande F38).
 * `expectedReturn` comes from an `<input type="datetime-local">`, so it is kept
 * as a string here and parsed on the server.
 */
export function createServiceStatusSchema(t: ValidationTranslator) {
  return z.object({
    service: z
      .string()
      .trim()
      .min(1, { error: t('service.required') })
      .max(64, { error: t('service.max64') }),
    status: z.enum(serviceAvailabilityStatuses, {
      error: t('status.required'),
    }),
    message: z
      .string()
      .trim()
      .max(500, { error: t('message.max500') })
      .optional()
      .or(z.literal('')),
    expectedReturn: z
      .string()
      .trim()
      .max(32, { error: t('expectedReturn.max32') })
      .optional()
      .or(z.literal('')),
    alternative: z
      .string()
      .trim()
      .max(500, { error: t('alternative.max500') })
      .optional()
      .or(z.literal('')),
  });
}

export type ServiceStatusValues = z.infer<
  ReturnType<typeof createServiceStatusSchema>
>;
