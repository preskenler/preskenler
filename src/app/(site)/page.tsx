import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import {
  RiArrowRightLine,
  RiCommunityLine,
  RiMailSendLine,
  RiMegaphoneLine,
} from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import {
  formatAnnouncementDate,
  getLatestAnnouncements,
} from '@/lib/announcements';
import { cityServices } from '@/lib/services';

export const metadata: Metadata = {
  title: 'PreskEnLer — Portail de la Ville de Terra Nova',
};

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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge variant="secondary">Ville de Terra Nova</Badge>
        <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Bienvenue sur le portail de Terra Nova
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Retrouve les services de la ville, consulte les annonces municipales
          et joins l’administration en quelques clics.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            Découvrir les services
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/contact" />}
          >
            Nous contacter
          </Button>
          {session ? null : (
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Créer mon compte
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {session
            ? `Connecté·e en tant que ${session.user.name}.`
            : 'Crée ton compte pour suivre tes démarches et retrouver ton espace personnel.'}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <AccessCard
          href="/services"
          title="Services municipaux"
          description={`${cityServices.length} services pour t’orienter dans tes démarches.`}
          icon={<RiCommunityLine className="size-5" aria-hidden="true" />}
        />
        <AccessCard
          href="/announcements"
          title="Annonces de la ville"
          description="L’actualité et les informations pratiques de Terra Nova."
          icon={<RiMegaphoneLine className="size-5" aria-hidden="true" />}
        />
        <AccessCard
          href="/contact"
          title="Contacter la mairie"
          description="Envoie un message au service concerné et garde une trace."
          icon={<RiMailSendLine className="size-5" aria-hidden="true" />}
        />
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold">
            Dernières annonces
          </h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/announcements" />}
          >
            Tout voir
            <RiArrowRightLine data-icon="inline-end" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {latest.map((announcement) => (
            <Card key={announcement.slug} size="sm">
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {announcement.category}
                </Badge>
                <CardTitle>
                  <Link
                    href={`/announcements/${announcement.slug}`}
                    className="hover:underline"
                  >
                    {announcement.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {formatAnnouncementDate(announcement.publishedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {announcement.excerpt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
