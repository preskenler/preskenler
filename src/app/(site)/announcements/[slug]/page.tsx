import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RiArrowLeftLine } from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatAnnouncementDate, getAnnouncement } from '@/lib/announcements';

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const announcement = getAnnouncement(slug);

  if (!announcement) {
    notFound();
  }

  const paragraphs = announcement.body.split('\n\n');

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
        Toutes les annonces
      </Button>

      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit">
          {announcement.category}
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          {announcement.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatAnnouncementDate(announcement.publishedAt)}
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
