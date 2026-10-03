'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { createAppointment } from '@/lib/appointment-store';
import { auth } from '@/lib/auth';
import {
  createAppointmentSchema,
  type AppointmentValues,
} from '@/lib/schemas/appointment';

export type AppointmentActionResult = {
  reference?: string;
  error?: string;
  slotUnavailable?: boolean;
};

/**
 * Books a citizen's appointment (demande F39). The slot is re-checked for
 * capacity server-side so two people cannot take the same single-seat slot.
 */
export async function submitAppointment(
  values: AppointmentValues,
): Promise<AppointmentActionResult> {
  const tValidation = await getTranslations('Validation.appointment');
  const tErrors = await getTranslations('Public.Appointments.form');
  const parsed = createAppointmentSchema(tValidation).safeParse(values);

  if (!parsed.success) {
    return { error: tErrors('error') };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const result = await createAppointment({
      userId: session?.user.id ?? null,
      slotId: parsed.data.slotId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone?.trim() || null,
      reason: parsed.data.reason,
    });

    if (!result.ok) {
      return {
        error: tErrors('slotUnavailable'),
        slotUnavailable: true,
      };
    }

    revalidatePath('/appointments');
    revalidatePath('/dashboard/appointments');

    return { reference: result.appointment.reference };
  } catch (error) {
    console.error('[appointments] booking failed', error);
    return { error: tErrors('error') };
  }
}
