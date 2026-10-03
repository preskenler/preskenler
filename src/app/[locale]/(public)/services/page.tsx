import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { cityServiceCategories, cityServices } from '@/lib/services';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Services');

  return {
    title: t('metaTitle'),
  };
}

export default async function ServicesPage() {
  const t = await getTranslations('Public.Services');

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

      {cityServiceCategories.map((category) => {
        const services = cityServices.filter(
          (service) => service.category === category,
        );

        if (services.length === 0) {
          return null;
        }

        return (
          <section key={category} className="flex flex-col gap-4">
            <h2 className="font-heading text-xl font-medium">
              {t(`categories.${category}`)}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <Card key={service.slug} size="sm">
                  <CardHeader>
                    <CardTitle>{t(`items.${service.slug}.name`)}</CardTitle>
                    <CardDescription>
                      {t(`items.${service.slug}.description`)}
                    </CardDescription>
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
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {service.email}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
