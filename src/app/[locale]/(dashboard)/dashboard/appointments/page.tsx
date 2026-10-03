import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { RiCalendarLine, RiDeleteBinLine } from '@remixicon/react';
import { getFormatter, getTranslations } from 'next-intl/server';

import { AppointmentSlotForm } from '@/components/dashboard/appointment-slot-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Link, redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import {
  isAppointmentUpcoming,
  type AppointmentStatus,
  type AppointmentView,
} from '@/lib/appointments';
import {
  getStaffAppointments,
  getUserAppointments,
  getUpcomingSlots,
} from '@/lib/appointment-store';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { cityServices } from '@/lib/services';
import { cancelOwnAppointment, deleteAppointmentSlot } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard.appointments');

  return { title: t('title') };
}

export const dynamic = 'force-dynamic';

function statusVariant(status: AppointmentStatus) {
  if (status === 'cancelled') {
    return 'destructive' as const;
  }
  if (status === 'completed') {
    return 'outline' as const;
  }
  return 'secondary' as const;
}

export default async function AppointmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Dashboard.appointments');
  const tServices = await getTranslations('Public.Services');
  const format = await getFormatter();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  const isStaff = hasPermission(session.user.role, {
    appointment: ['list'],
  });
  const appointments = isStaff
    ? await getStaffAppointments()
    : await getUserAppointments(session.user.id);
  const slots = isStaff ? await getUpcomingSlots() : [];

  const upcoming = appointments.filter((appointment) =>
    isAppointmentUpcoming(appointment),
  );
  const past = appointments.filter(
    (appointment) => !isAppointmentUpcoming(appointment),
  );

  const serviceName = (slug: string) =>
    cityServices.some((service) => service.slug === slug)
      ? tServices(`items.${slug}.name`)
      : slug;

  function renderAppointment(appointment: AppointmentView) {
    const cancelable = !isStaff && isAppointmentUpcoming(appointment);

    return (
      <Card key={appointment.id} size="sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={statusVariant(appointment.status)}>
              {t(appointment.status)}
            </Badge>
            <Badge variant="outline">{serviceName(appointment.service)}</Badge>
            <span className="font-medium">
              {t('reference', { reference: appointment.reference })}
            </span>
          </div>
          <CardTitle>
            {format.dateTime(new Date(appointment.startsAt), {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          </CardTitle>
          <CardDescription>
            {t('when', {
              date: format.dateTime(new Date(appointment.startsAt), {
                dateStyle: 'medium',
              }),
              duration: appointment.durationMinutes,
            })}
            {appointment.agentName
              ? ` · ${t('agent', { agent: appointment.agentName })}`
              : ''}
            {appointment.location
              ? ` · ${t('location', { location: appointment.location })}`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isStaff ? (
            <p className="text-xs text-muted-foreground">
              {appointment.name} · {appointment.email}
              {appointment.phone ? ` · ${appointment.phone}` : ''}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">{appointment.reason}</p>

          {cancelable ? (
            <form action={cancelOwnAppointment}>
              <input type="hidden" name="id" value={appointment.id} />
              <Button type="submit" size="sm" variant="outline">
                {t('cancel')}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          {isStaff ? t('description') : t('mine')}
        </p>
        {!isStaff ? (
          <Button nativeButton={false} render={<Link href="/appointments" />}>
            <RiCalendarLine data-icon="inline-start" aria-hidden="true" />
            {t('bookButton')}
          </Button>
        ) : null}
      </div>

      {isStaff ? (
        <>
          <AppointmentSlotForm
            services={cityServices.map((service) => ({
              slug: service.slug,
              name: tServices(`items.${service.slug}.name`),
            }))}
          />

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-medium">
              {t('slots.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('slots.description')}
            </p>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('slots.empty')}
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {slots.map((slot) => (
                  <Card key={slot.id} size="sm">
                    <CardHeader>
                      <CardTitle>
                        {format.dateTime(new Date(slot.startsAt), {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </CardTitle>
                      <CardDescription>
                        {serviceName(slot.service)}
                        {slot.agentName ? ` · ${slot.agentName}` : ''}
                        {slot.location ? ` · ${slot.location}` : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        {t('slots.remaining', {
                          remaining: slot.remaining,
                          capacity: slot.capacity,
                        })}
                      </span>
                      <form action={deleteAppointmentSlot}>
                        <input type="hidden" name="id" value={slot.id} />
                        <Button type="submit" size="sm" variant="outline">
                          <RiDeleteBinLine
                            data-icon="inline-start"
                            aria-hidden="true"
                          />
                          {t('slots.delete')}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">{t('upcoming')}</h2>
        {upcoming.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{isStaff ? t('empty') : t('emptyMine')}</EmptyTitle>
              <EmptyDescription>{t('mine')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map(renderAppointment)}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-medium">{t('past')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {past.map(renderAppointment)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
