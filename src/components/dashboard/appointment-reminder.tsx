import { getFormatter, getTranslations } from 'next-intl/server';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { AppointmentView } from '@/lib/appointments';

/**
 * In-app reminder for an upcoming appointment (demande F40). Email delivery is
 * not wired yet, so this is the reliable reminder channel: the next appointment
 * within the reminder window appears on the citizen overview.
 */
export async function AppointmentReminder({
  appointments,
}: {
  appointments: AppointmentView[];
}) {
  const t = await getTranslations('Dashboard.appointments');
  const format = await getFormatter();

  const next = [...appointments].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )[0];

  if (!next) {
    return null;
  }

  return (
    <Alert role="status">
      <AlertTitle>{t('reminder.title')}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>
          {t('reminder.description', {
            date: format.dateTime(new Date(next.startsAt), {
              dateStyle: 'full',
              timeStyle: 'short',
            }),
          })}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="w-fit"
          nativeButton={false}
          render={<Link href="/dashboard/appointments" />}
        >
          {t('reminder.action')}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
