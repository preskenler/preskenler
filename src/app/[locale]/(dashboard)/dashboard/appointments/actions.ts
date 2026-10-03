'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import {
  cancelAppointment,
  createSlot,
  deleteSlot,
} from '@/lib/appointment-store';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { createSlotSchema } from '@/lib/schemas/appointment';

export type SlotActionState = {
  status: 'idle' | 'success' | 'error';
  error?: string;
};

/** Citizens cancel their own booking (demande F39). */
export async function cancelOwnAppointment(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  const id = String(formData.get('id') ?? '');
  if (!id) {
    return;
  }

  await cancelAppointment(id, session.user.id);
  revalidatePath('/dashboard/appointments');
}

/** Staff publish a bookable slot (demande F39). */
export async function createAppointmentSlot(
  _previous: SlotActionState,
  formData: FormData,
): Promise<SlotActionState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    !hasPermission(session.user.role, { appointment: ['create'] })
  ) {
    throw new Error('UNAUTHORIZED');
  }

  const t = await getTranslations('Validation.appointment');
  const parsed = createSlotSchema(t).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message };
  }

  const startsAt = new Date(parsed.data.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return { status: 'error', error: t('startsAt.required') };
  }

  const result = await createSlot({
    service: parsed.data.service,
    startsAt,
    durationMinutes: parsed.data.durationMinutes,
    agentName: parsed.data.agentName?.trim() || null,
    location: parsed.data.location?.trim() || null,
    capacity: parsed.data.capacity,
  });

  if (!result.ok) {
    const tSlots = await getTranslations('Dashboard.appointments.slots');
    return { status: 'error', error: tSlots('duplicate') };
  }

  revalidatePath('/dashboard/appointments');
  revalidatePath('/appointments');

  return { status: 'success' };
}

/** Staff remove a published slot (demande F39). */
export async function deleteAppointmentSlot(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    !hasPermission(session.user.role, { appointment: ['delete'] })
  ) {
    throw new Error('UNAUTHORIZED');
  }

  const id = String(formData.get('id') ?? '');
  if (!id) {
    return;
  }

  await deleteSlot(id);
  revalidatePath('/dashboard/appointments');
  revalidatePath('/appointments');
}
