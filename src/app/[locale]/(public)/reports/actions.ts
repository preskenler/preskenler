'use server';

import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';
import { createProblemReport } from '@/lib/report-store';
import { createReportSchema, type ReportValues } from '@/lib/schemas/report';

export type ReportActionResult = { reference?: string; error?: string };

/**
 * Stores a citizen problem report (demande F25) and returns the human-readable
 * reference shown as an immediate confirmation (demande D16).
 */
export async function submitProblemReport(
  values: ReportValues,
): Promise<ReportActionResult> {
  const tValidation = await getTranslations('Validation.report');
  const tErrors = await getTranslations('Public.Reports.form');
  const parsed = createReportSchema(tValidation).safeParse(values);

  if (!parsed.success) {
    return { error: tErrors('error') };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const report = await createProblemReport({
      userId: session?.user.id ?? null,
      ...parsed.data,
    });

    return { reference: report.reference };
  } catch (error) {
    console.error('[reports] failed to store problem report', error);
    return { error: tErrors('error') };
  }
}
