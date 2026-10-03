import type { Metadata } from 'next';
import {
  RiBusLine,
  RiEBikeLine,
  RiInformationLine,
  RiTicket2Line,
  RiTimeLine,
} from '@remixicon/react';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { transportLines } from '@/lib/transport';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Transport');

  return {
    title: t('metaTitle'),
  };
}

const fareKeys = ['single', 'day', 'month'] as const;
const infoKeys = ['realtime', 'accessibility', 'bikes'] as const;

export default async function TransportPage() {
  const t = await getTranslations('Public.Transport');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          {t('description')}
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-medium">{t('linesTitle')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {transportLines.map((line) => (
            <Card key={line.slug} size="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RiBusLine aria-hidden="true" className="size-5" />
                  <CardTitle>{t(`lines.${line.slug}.name`)}</CardTitle>
                  <Badge variant="outline">{t(`modes.${line.mode}`)}</Badge>
                </div>
                <CardDescription>
                  {t(`lines.${line.slug}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <RiTimeLine aria-hidden="true" className="size-4" />
                  {t('frequency', {
                    value: t(`lines.${line.slug}.frequency`),
                  })}
                </p>
                <p>
                  {t('firstLast', {
                    first: t(`lines.${line.slug}.first`),
                    last: t(`lines.${line.slug}.last`),
                  })}
                </p>
                <p>{t(`lines.${line.slug}.stops`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-medium">{t('faresTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {fareKeys.map((key) => (
            <Card key={key} size="sm">
              <CardHeader>
                <RiTicket2Line aria-hidden="true" className="size-5" />
                <CardTitle>{t(`fares.${key}.title`)}</CardTitle>
                <CardDescription>
                  {t(`fares.${key}.description`)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{t('faresNote')}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-medium">{t('infoTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {infoKeys.map((key) => (
            <Card key={key} size="sm">
              <CardHeader>
                <RiInformationLine aria-hidden="true" className="size-5" />
                <CardTitle>{t(`info.${key}.title`)}</CardTitle>
                <CardDescription>
                  {t(`info.${key}.description`)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <RiEBikeLine aria-hidden="true" className="size-4" />
          {t('contactHint')}{' '}
          <Link href="/contact?service=voirie-mobilite" className="underline">
            {t('contactLink')}
          </Link>
        </p>
      </section>
    </div>
  );
}
