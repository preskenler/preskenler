import { WaitlistForm } from '@/components/landing/waitlist-form';
import { Badge } from '@/components/ui/badge';

// TODO(copy): every string below is a placeholder until the product is announced.
export function ComingSoon() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <Badge variant="secondary" className="h-6 gap-2 px-3">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Bientôt disponible
        </Badge>

        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            PreskEnLer arrive bientôt.
          </h1>
          <p className="mx-auto max-w-md text-base text-pretty text-muted-foreground sm:text-lg">
            On prépare quelque chose. Laisse ton email pour être prévenu·e du
            lancement.
          </p>
        </div>

        <WaitlistForm />
      </div>

      <footer className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} PreskEnLer
      </footer>
    </main>
  );
}
