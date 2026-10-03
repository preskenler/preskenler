'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { isProblemStatus } from '@/lib/reports';
import { setProblemReportStatus } from '@/lib/report-store';

/** Staff triage of a citizen problem report (demande F25). */
export async function setReportStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    !hasPermission(session.user.role, { problemReport: ['update'] })
  ) {
    throw new Error('UNAUTHORIZED');
  }

  const id = String(formData.get('id') ?? '');
  const rawStatus = String(formData.get('status') ?? '');
  const status = isProblemStatus(rawStatus) ? rawStatus : 'new';

  if (!id) {
    return;
  }

  await setProblemReportStatus(id, status);
  revalidatePath('/dashboard/reports');
}
