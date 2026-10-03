import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { getLatestAnnouncements } from '@/lib/announcements';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Announcements');

  return {
    title: t('metaTitle'),
  };
}

export default async function AnnouncementsPage() {
  const announcements = getLatestAnnouncements(Number.MAX_SAFE_INTEGER);
  const t = await getTranslations('Public.Announcements');
  const format = await getFormatter();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          {t('description')}
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.slug} size="sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {t(`categories.${announcement.category}`)}
                </Badge>
                <CardDescription>
                  {format.dateTime(new Date(announcement.publishedAt), {
                    dateStyle: 'long',
                  })}
                </CardDescription>
              </div>
              <CardTitle>
                <Link
                  href={`/announcements/${announcement.slug}`}
                  className="hover:underline"
                >
                  {t(`items.${announcement.slug}.title`)}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-pretty text-muted-foreground">
                {t(`items.${announcement.slug}.excerpt`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
