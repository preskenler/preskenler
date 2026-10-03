import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

export default async function LegacyRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return redirect({
    href: '/dashboard/account/messages',
    locale: locale as AppLocale,
  });
}
