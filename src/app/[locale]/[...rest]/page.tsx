import { notFound } from 'next/navigation';

/**
 * Catch-all for unknown localized routes (e.g. `/fr/inexistant`), so the
 * `[locale]/not-found.tsx` page renders instead of a bare Next.js 404.
 */
export default function CatchAllPage() {
  notFound();
}
