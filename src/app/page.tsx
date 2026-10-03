import { ComingSoon } from '@/components/landing/coming-soon';
import { ThemeToggle } from '@/components/theme-toggle';

export default function IndexPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <ComingSoon />
      </div>
    </main>
  );
}
