import { z } from 'zod';

import {
  broadcastAudiences,
  broadcastLevels,
  broadcastTopics,
} from '@/lib/broadcasts';

/**
 * Validation for the staff broadcast form (demandes D18, F29, F31). Mirrors the
 * `Validation.broadcast` messages; the server action is the authority.
 */
export type BroadcastTranslator = (key: string) => string;

export function createBroadcastSchema(t: BroadcastTranslator) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(3, { error: t('titleMin') })
      .max(160, { error: t('titleMax') }),
    body: z
      .string()
      .trim()
      .min(10, { error: t('bodyMin') })
      .max(5000, { error: t('bodyMax') }),
    level: z.enum(broadcastLevels),
    topic: z.enum(broadcastTopics),
    audience: z.enum(broadcastAudiences),
    area: z
      .string()
      .trim()
      .max(120, { error: t('areaMax') }),
    recommendations: z
      .string()
      .trim()
      .max(2000, { error: t('recommendationsMax') }),
    expiresAt: z.string().trim(),
  });
}

export type BroadcastValues = z.infer<ReturnType<typeof createBroadcastSchema>>;
