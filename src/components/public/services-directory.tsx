'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RiSearchLine } from '@remixicon/react';

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
import { cn } from '@/lib/utils';

export type ServiceDirectoryItem = {
  slug: string;
  category: string;
  email: string;
  name: string;
  description: string;
};

export type ServiceDirectoryCategory = {
  key: string;
  label: string;
};

/** Accent- and case-insensitive comparison so "sante" matches "Santé". */
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Searchable services directory (demande F32): residents can find the right
 * service — especially health services — without scanning the whole catalogue.
 */
export function ServicesDirectory({
  items,
  categories,
}: {
  items: ServiceDirectoryItem[];
  categories: ServiceDirectoryCategory[];
}) {
  const t = useTranslations('Public.Services');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const needle = normalize(query.trim());

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
                  <Card key={service.slug} size="sm">
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-3">
                      <Button
                        size="sm"
                        nativeButton={false}
                        render={
                          <Link href={`/contact?service=${service.slug}`} />
                        }
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
