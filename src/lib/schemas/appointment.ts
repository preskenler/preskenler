import { z } from 'zod';

export type ValidationTranslator = (key: string) => string;

/**
 * Booking form rules (demande F39). The chosen slot is carried as an id, so the
 * confirmation can only ever display the exact créneau the citizen selected.
 */
export function createAppointmentSchema(t: ValidationTranslator) {
  return z.object({
    slotId: z
      .string()
      .trim()
      .min(1, { error: t('slot.required') }),
    name: z
      .string()
      .trim()
      .min(1, { error: t('name.required') })
      .max(120, { error: t('name.max120') }),
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: t('email.invalid') })),
    phone: z
      .string()
      .trim()
      .max(32, { error: t('phone.max32') })
      .optional()
      .or(z.literal('')),
    reason: z
      .string()
      .trim()
      .min(5, { error: t('reason.min') })
      .max(1000, { error: t('reason.max1000') }),
  });
}

export type AppointmentValues = z.infer<
  ReturnType<typeof createAppointmentSchema>
>;

/** Staff slot creation (demande F39). */
export function createSlotSchema(t: ValidationTranslator) {
  return z.object({
    service: z
      .string()
      .trim()
      .min(1, { error: t('service.required') }),
    startsAt: z
      .string()
      .trim()
      .min(1, { error: t('startsAt.required') }),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(10, { error: t('duration.min') })
      .max(180, { error: t('duration.max') }),
    agentName: z
      .string()
      .trim()
      .max(120, { error: t('agentName.max120') })
      .optional()
      .or(z.literal('')),
    location: z
      .string()
      .trim()
      .max(200, { error: t('location.max200') })
      .optional()
      .or(z.literal('')),
    capacity: z.coerce
      .number()
      .int()
      .min(1, { error: t('capacity.min') })
      .max(20, { error: t('capacity.max') }),
  });
}

export type SlotValues = z.infer<ReturnType<typeof createSlotSchema>>;
