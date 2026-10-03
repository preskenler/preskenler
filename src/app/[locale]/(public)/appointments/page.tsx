import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { AppointmentBooking } from '@/components/public/appointment-booking';
import { getBookableSlots } from '@/lib/appointment-store';
import { auth } from '@/lib/auth';
import { cityServices } from '@/lib/services';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Appointments');

  return {
    title: t('metaTitle'),
  };
}

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const t = await getTranslations('Public.Appointments');
  const tServices = await getTranslations('Public.Services');
  const slots = await getBookableSlots();

  const services = cityServices.map((service) => ({
    slug: service.slug,
    name: tServices(`items.${service.slug}.name`),
  }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-pretty text-muted-foreground">{t('description')}</p>
      </header>

      <AppointmentBooking
        services={services}
        slots={slots}
        defaultName={session?.user.name ?? ''}
        defaultEmail={session?.user.email ?? ''}
      />
    </div>
  );
}
