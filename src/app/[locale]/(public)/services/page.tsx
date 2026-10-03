import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ServicesDirectory } from '@/components/public/services-directory';
import { prisma } from '@/lib/prisma';
import { getServiceStatusMap } from '@/lib/service-status-store';
import {
  cityServiceCategories,
  cityServices,
  getFeaturedServices,
} from '@/lib/services';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Services');

  return {
    title: t('metaTitle'),
  };
}

// Availability and popularity are live, so the catalogue is never prerendered.
export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const t = await getTranslations('Public.Services');

  const [statusMap, groupedCounts] = await Promise.all([
    getServiceStatusMap(),
    prisma.serviceMessage.groupBy({
      by: ['service'],
      _count: { _all: true },
    }),
  ]);

  const categories = cityServiceCategories.map((category) => ({
    key: category,
    label: t(`categories.${category}`),
  }));

  const items = cityServices.map((service) => {
    const availability = statusMap.get(service.slug) ?? null;
    return {
      slug: service.slug,
      category: service.category,
      email: service.email,
      name: t(`items.${service.slug}.name`),
      description: t(`items.${service.slug}.description`),
      availability,
    };
  });

  // Priorities curated by the city first, then the services residents contact
  // most often (demande F28), de-duplicated and capped so the list stays useful.
  const knownSlugs = new Set(cityServices.map((service) => service.slug));
  const popularSlugs = groupedCounts
    .filter((entry) => knownSlugs.has(entry.service))
    .sort((a, b) => b._count._all - a._count._all)
    .map((entry) => entry.service);

  const highlighted: { slug: string; badge: 'priority' | 'popular' }[] = [];
  for (const service of getFeaturedServices()) {
    highlighted.push({ slug: service.slug, badge: 'priority' });
  }
  for (const slug of popularSlugs) {
    if (
      highlighted.length < 6 &&
      !highlighted.some((entry) => entry.slug === slug)
    ) {
      highlighted.push({ slug, badge: 'popular' });
    }
  }

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

      <ServicesDirectory
        items={items}
        categories={categories}
        highlighted={highlighted.slice(0, 6)}
      />
    </div>
  );
}
