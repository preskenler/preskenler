import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RiArrowLeftLine } from '@remixicon/react';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getAnnouncement } from '@/lib/announcements';

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const announcement = getAnnouncement(slug);

  if (!announcement) {
    return {};
  }

  const t = await getTranslations('Public.Announcements');
  const title = t(`items.${slug}.title`);

  return {
    title: `${title} — PreskEnLer`,
  };
}

export default async function AnnouncementPage({ params }: PageParams) {
  const { slug } = await params;
  const announcement = getAnnouncement(slug);

  if (!announcement) {
    notFound();
  }

  const t = await getTranslations('Public.Announcements');
  const format = await getFormatter();
  const paragraphs = t(`items.${slug}.body`).split('\n\n');

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/announcements" />}
      >
        <RiArrowLeftLine data-icon="inline-start" />
        {t('all')}
      </Button>

      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit">
          {t(`categories.${announcement.category}`)}
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          {t(`items.${slug}.title`)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {format.dateTime(new Date(announcement.publishedAt), {
            dateStyle: 'long',
          })}
        </p>
      </header>

      <div className="flex flex-col gap-4 text-pretty leading-relaxed">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
