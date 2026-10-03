'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';
import {
  buildHeatwaveRecommendations,
  type BroadcastAudience,
  type BroadcastFormState,
} from '@/lib/broadcasts';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { createBroadcastSchema } from '@/lib/schemas/broadcast';

async function requireBroadcast(permission: 'create' | 'update' | 'delete') {
  return { broadcast: [permission] } satisfies Record<string, string[]>;
}

/** Publish a general message or alert (demandes D18, F29, F31). */
export async function createBroadcast(
  _previous: BroadcastFormState,
  formData: FormData,
): Promise<BroadcastFormState> {
  const t = await getTranslations('Validation.broadcast');
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    !hasPermission(session.user.role, await requireBroadcast('create'))
  ) {
    return { status: 'error', error: t('unauthorized') };
  }

  const parsed = createBroadcastSchema(t).safeParse({
    title: formData.get('title') ?? '',
    body: formData.get('body') ?? '',
    level: formData.get('level') ?? 'info',
    topic: formData.get('topic') ?? 'general',
    audience: formData.get('audience') ?? 'all',
    area: formData.get('area') ?? '',
    recommendations: formData.get('recommendations') ?? '',
    expiresAt: formData.get('expiresAt') ?? '',
  });

  if (!parsed.success) {
    return { status: 'error', error: t('invalid') };
  }

  const data = parsed.data;
  const audience = data.audience as BroadcastAudience;
  // A heatwave alert always ships actionable advice (demande F31): the curated
  // fallback fills the field when staff left it empty.
  const recommendations =
    data.recommendations ||
    (data.topic === 'heatwave' ? buildHeatwaveRecommendations(audience) : '');
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return { status: 'error', error: t('invalid') };
  }

  try {
    await prisma.broadcast.create({
      data: {
        title: data.title,
        body: data.body,
        level: data.level,
        topic: data.topic,
        audience,
        area: data.area || null,
        recommendations: recommendations || null,
        isAi: data.topic === 'heatwave',
        expiresAt,
        createdById: session.user.id,
      },
    });
  } catch {
    return { status: 'error', error: t('server') };
  }

  revalidatePath('/dashboard/broadcasts');
  revalidatePath('/dashboard');
  revalidatePath('/alerts');

  return { status: 'success' };
}

/** Take a message offline or bring it back. */
export async function setBroadcastActive(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    !hasPermission(session.user.role, await requireBroadcast('update'))
  ) {
    return;
  }

  const id = String(formData.get('id') ?? '');

  if (!id) {
    return;
  }

  await prisma.broadcast.update({
    where: { id },
    data: { active: formData.get('active') === 'true' },
  });

  revalidatePath('/dashboard/broadcasts');
  revalidatePath('/dashboard');
  revalidatePath('/alerts');
}

/** Remove a message for good. */
export async function deleteBroadcast(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    !hasPermission(session.user.role, await requireBroadcast('delete'))
  ) {
    return;
  }

  const id = String(formData.get('id') ?? '');

  if (!id) {
    return;
  }

  await prisma.broadcast.delete({ where: { id } });

  revalidatePath('/dashboard/broadcasts');
  revalidatePath('/dashboard');
  revalidatePath('/alerts');
}
