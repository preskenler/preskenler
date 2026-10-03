'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { createServiceStatusSchema } from '@/lib/schemas/service-status';
import { cityServices } from '@/lib/services';
import { upsertServiceStatus } from '@/lib/service-status-store';

export type ServiceStatusActionState = {
  status: 'idle' | 'success' | 'error';
  error?: string;
};

export async function updateServiceStatus(
  _previous: ServiceStatusActionState,
  formData: FormData,
): Promise<ServiceStatusActionState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    !hasPermission(session.user.role, { serviceStatus: ['update'] })
  ) {
    throw new Error('UNAUTHORIZED');
  }

  const t = await getTranslations('Validation.serviceStatus');
  const parsed = createServiceStatusSchema(t).safeParse(
    Object.fromEntries(formData),
  );

  if (!parsed.success) {
    return {
      status: 'error',
      error: parsed.error.issues[0]?.message,
    };
  }

  if (!cityServices.some((service) => service.slug === parsed.data.service)) {
    return { status: 'error', error: t('service.required') };
  }

  const expectedReturn = parsed.data.expectedReturn
    ? new Date(parsed.data.expectedReturn)
    : null;

  if (expectedReturn && Number.isNaN(expectedReturn.getTime())) {
    return { status: 'error', error: t('expectedReturn.max32') };
  }

  await upsertServiceStatus({
    service: parsed.data.service,
    status: parsed.data.status,
    message: parsed.data.message?.trim() || null,
    expectedReturn,
    alternative: parsed.data.alternative?.trim() || null,
    updatedById: session.user.id,
  });

  revalidatePath('/dashboard/service-status');
  revalidatePath('/services');
  revalidatePath('/contact');

  return { status: 'success' };
}
