import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import {
  RiArrowRightLine,
  RiBusLine,
  RiCommunityLine,
  RiMailSendLine,
  RiMegaphoneLine,
} from '@remixicon/react';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import { getLatestAnnouncements } from '@/lib/announcements';
import { cityServices } from '@/lib/services';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Home');

  return {
    title: t('metaTitle'),
  };
}

function AccessCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground"
        >
          {icon}
        </span>
        <CardTitle>
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const latest = getLatestAnnouncements(3);
  const t = await getTranslations('Public.Home');
  const tAnnouncements = await getTranslations('Public.Announcements');
  const format = await getFormatter();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge variant="secondary">{t('badge')}</Badge>
        <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          {t('description')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            {t('discoverServices')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/contact" />}
          >
            {t('contact')}
          </Button>
          {session ? null : (
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              {t('createAccount')}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {session
            ? t('connectedAs', { name: session.user.name })
            : t('createAccountHint')}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AccessCard
          href="/services"
          title={t('cards.services.title')}
          description={t('cards.services.description', {
            count: cityServices.length,
          })}
          icon={<RiCommunityLine className="size-5" aria-hidden="true" />}
        />
        <AccessCard
          href="/transport"
          title={t('cards.transport.title')}
          description={t('cards.transport.description')}
          icon={<RiBusLine className="size-5" aria-hidden="true" />}
        />
        <AccessCard
          href="/announcements"
          title={t('cards.announcements.title')}
          description={t('cards.announcements.description')}
          icon={<RiMegaphoneLine className="size-5" aria-hidden="true" />}
        />
        <AccessCard
          href="/contact"
          title={t('cards.contact.title')}
          description={t('cards.contact.description')}
          icon={<RiMailSendLine className="size-5" aria-hidden="true" />}
        />
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold">{t('latest')}</h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/announcements" />}
          >
            {t('seeAll')}
            <RiArrowRightLine data-icon="inline-end" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {latest.map((announcement) => (
            <Card key={announcement.slug} size="sm">
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {tAnnouncements(`categories.${announcement.category}`)}
                </Badge>
                <CardTitle>
                  <Link
                    href={`/announcements/${announcement.slug}`}
                    className="hover:underline"
                  >
                    {tAnnouncements(`items.${announcement.slug}.title`)}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {format.dateTime(new Date(announcement.publishedAt), {
                    dateStyle: 'long',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {tAnnouncements(`items.${announcement.slug}.excerpt`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
