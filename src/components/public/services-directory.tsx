'use client';

import { useMemo, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { RiSearchLine } from '@remixicon/react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import type { ServiceAvailabilityStatus } from '@/lib/service-status';
import { cn } from '@/lib/utils';

export type ServiceAvailability = {
  status: ServiceAvailabilityStatus;
  message: string | null;
  expectedReturn: string | null;
  alternative: string | null;
};

export type ServiceDirectoryItem = {
  slug: string;
  category: string;
  email: string;
  name: string;
  description: string;
  availability: ServiceAvailability | null;
};

export type ServiceDirectoryCategory = {
  key: string;
  label: string;
};

export type HighlightedService = {
  slug: string;
  badge: 'priority' | 'popular';
};

/** Accent- and case-insensitive comparison so "sante" matches "Santé". */
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** A single catalogue card, shared by the highlighted and grouped sections. */
function ServiceCard({
  service,
  badge,
}: {
  service: ServiceDirectoryItem;
  badge?: HighlightedService['badge'];
}) {
  const t = useTranslations('Public.Services');
  const format = useFormatter();
  const availability = service.availability;
  const unavailable = availability && availability.status !== 'available';

  return (
    <Card key={service.slug} size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{service.name}</CardTitle>
          {badge ? (
            <Badge variant={badge === 'priority' ? 'default' : 'secondary'}>
              {badge === 'priority'
                ? t('featured.priorityBadge')
                : t('featured.badge')}
            </Badge>
          ) : null}
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {unavailable && availability ? (
          <Alert
            variant={
              availability.status === 'incident' ? 'destructive' : 'default'
            }
          >
            <AlertTitle>{t(`availability.${availability.status}`)}</AlertTitle>
            <AlertDescription>
              <p>{availability.message ?? t('availability.notice')}</p>
              {availability.expectedReturn ? (
                <p>
                  {t('availability.expectedReturn', {
                    date: format.dateTime(
                      new Date(availability.expectedReturn),
                      { dateStyle: 'long', timeStyle: 'short' },
                    ),
                  })}
                </p>
              ) : null}
              {availability.alternative ? (
                <p>
                  {t('availability.alternative', {
                    alternative: availability.alternative,
                  })}
                </p>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/contact?service=${service.slug}`} />}
          >
            {t('contactService')}
          </Button>
          <a
            href={`mailto:${service.email}`}
            className={cn(
              'text-sm text-muted-foreground hover:text-foreground',
            )}
          >
            {service.email}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Searchable services directory (demandes F32 & F28): residents find the right
 * service without scanning the whole catalogue, and the most requested ones are
 * highlighted up top.
 */
export function ServicesDirectory({
  items,
  categories,
  highlighted = [],
}: {
  items: ServiceDirectoryItem[];
  categories: ServiceDirectoryCategory[];
  highlighted?: HighlightedService[];
}) {
  const t = useTranslations('Public.Services');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const needle = normalize(query.trim());
  const isBrowsing = activeCategory === 'all' && !needle;

  const bySlug = useMemo(
    () => new Map(items.map((item) => [item.slug, item])),
    [items],
  );

  const highlightedItems = useMemo(
    () =>
      highlighted
        .map((entry) => {
          const service = bySlug.get(entry.slug);
          return service ? { service, badge: entry.badge } : null;
        })
        .filter(
          (
            entry,
          ): entry is {
            service: ServiceDirectoryItem;
            badge: 'priority' | 'popular';
          } => entry !== null,
        ),
    [highlighted, bySlug],
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        normalize(item.name).includes(needle) ||
        normalize(item.description).includes(needle)
      );
    });
  }, [items, activeCategory, needle]);

  return (
    <div className="flex flex-col gap-8">
      {highlightedItems.length > 0 && isBrowsing ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl font-medium">
              {t('featured.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('featured.description')}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {highlightedItems.map(({ service, badge }) => (
              <ServiceCard key={service.slug} service={service} badge={badge} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <RiSearchLine
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.label')}
            className="ps-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          >
            {t('search.all')}
          </Button>
          {categories.map((category) => (
            <Button
              key={category.key}
              type="button"
              size="sm"
              variant={activeCategory === category.key ? 'default' : 'outline'}
              aria-pressed={activeCategory === category.key}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t('search.noResults', { query: query.trim() })}
        </p>
      ) : (
        categories.map((category) => {
          const services = filtered.filter(
            (item) => item.category === category.key,
          );

          if (services.length === 0) {
            return null;
          }

          return (
            <section key={category.key} className="flex flex-col gap-4">
              <h2 className="font-heading text-xl font-medium">
                {category.label}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <ServiceCard key={service.slug} service={service} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
