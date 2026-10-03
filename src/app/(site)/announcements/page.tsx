import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  formatAnnouncementDate,
  getLatestAnnouncements,
} from '@/lib/announcements';

export const metadata = {
  title: 'Annonces — PreskEnLer',
};

export default function AnnouncementsPage() {
  const announcements = getLatestAnnouncements(Number.MAX_SAFE_INTEGER);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Annonces de la ville
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Informations pratiques, changements de service et actualité de Terra
          Nova.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.slug} size="sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{announcement.category}</Badge>
                <CardDescription>
                  {formatAnnouncementDate(announcement.publishedAt)}
                </CardDescription>
              </div>
              <CardTitle>
                <Link
                  href={`/announcements/${announcement.slug}`}
                  className="hover:underline"
                >
                  {announcement.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-pretty text-muted-foreground">
                {announcement.excerpt}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
