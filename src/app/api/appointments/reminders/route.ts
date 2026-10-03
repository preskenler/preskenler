import {
  getAppointmentsDueForReminder,
  markAppointmentsReminded,
} from '@/lib/appointment-store';
import type { AppointmentView } from '@/lib/appointments';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Scheduler entry point for appointment reminders (demande F40). Called by the
 * cPanel cron every few minutes with the same Bearer secret as the Webcup sync:
 *   curl -fsS -H "Authorization: Bearer $WEBCUP_CRON_SECRET" \
 *     https://<host>/api/appointments/reminders
 */

function isAuthorized(request: Request): boolean {
  const secret =
    process.env.WEBCUP_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }

  return request.headers.get('authorization') === `Bearer ${secret}`;
}

function formatReminderDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function buildReminderText(appointment: AppointmentView): string {
  const lines = [
    `Bonjour ${appointment.name},`,
    '',
    `Rappel : votre rendez-vous (n° ${appointment.reference}) est prévu le ${formatReminderDate(
      appointment.startsAt,
    )}.`,
    `Durée : ${appointment.durationMinutes} minutes.`,
  ];

  if (appointment.location) {
    lines.push(`Lieu : ${appointment.location}.`);
  }
  if (appointment.agentName) {
    lines.push(`Agent : ${appointment.agentName}.`);
  }

  lines.push(
    '',
    'Pensez à apporter une pièce d’identité.',
    '',
    'La Ville de Nova Terra',
  );

  return lines.join('\n');
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const due = await getAppointmentsDueForReminder();

    for (const appointment of due) {
      await sendEmail({
        to: appointment.email,
        subject: `Rappel de rendez-vous — ${appointment.reference}`,
        text: buildReminderText(appointment),
      });
    }

    await markAppointmentsReminded(due.map((appointment) => appointment.id));

    return Response.json({
      ok: true,
      reminded: due.length,
      references: due.map((appointment) => appointment.reference),
    });
  } catch (error) {
    console.error('[appointments] reminder run failed', error);
    return Response.json(
      { ok: false, error: 'reminders_unavailable' },
      { status: 502 },
    );
  }
}
