import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement de la page"
      className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16"
    >
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-11 w-full max-w-xl sm:h-14" />
        <Skeleton className="h-5 w-full max-w-md" />
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
    </main>
  );
}
