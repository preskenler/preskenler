import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cityServiceCategories, cityServices } from '@/lib/services';

export const metadata = {
  title: 'Services municipaux — PreskEnLer',
};

export default function ServicesPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Services municipaux
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Identifie le service qui correspond à ton besoin et contacte-le
          directement depuis le portail.
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
            <h2 className="font-heading text-xl font-medium">{category}</h2>
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
                      Contacter ce service
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
