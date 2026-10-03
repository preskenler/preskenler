import { headers } from 'next/headers';

import { ContactForm } from '@/components/public/contact-form';
import { auth } from '@/lib/auth';
import { cityServices } from '@/lib/services';

export const metadata = {
  title: 'Contact — PreskEnLer',
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { service } = await searchParams;
  const defaultService =
    service && cityServices.some((item) => item.slug === service)
      ? service
      : undefined;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Contacter la mairie
        </h1>
        <p className="text-pretty text-muted-foreground">
          Transmets ta question ou ta difficulté au service concerné. Tu reçois
          une confirmation immédiate après l’envoi.
        </p>
      </header>

      <ContactForm
        services={cityServices}
        defaultName={session?.user.name ?? ''}
        defaultEmail={session?.user.email ?? ''}
        defaultService={defaultService}
      />
    </div>
  );
}
