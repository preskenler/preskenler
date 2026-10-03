import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ServicesDirectory } from '@/components/public/services-directory';
import { cityServiceCategories, cityServices } from '@/lib/services';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Services');

  return {
    title: t('metaTitle'),
  };
}

export default async function ServicesPage() {
  const t = await getTranslations('Public.Services');

  const categories = cityServiceCategories.map((category) => ({
    key: category,
    label: t(`categories.${category}`),
  }));

  const items = cityServices.map((service) => ({
    slug: service.slug,
    category: service.category,
    email: service.email,
    name: t(`items.${service.slug}.name`),
    description: t(`items.${service.slug}.description`),
  }));

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

      <ServicesDirectory items={items} categories={categories} />
    </div>
  );
}
